import { SplittedMetar } from "src/interfaces/splittedMetar.interface";

export class MetarResolver {
  private static readonly regex = {
    ICAO: {
      main: /^(?<type>METAR\s|SPECI\s)?(?<airport>\w{4})\s(?<timestamp>\d{6}Z)\s(?<is_auto>AUTO\s)?(?<wind>(?:(?:P?[\d\/]{5}(?:G[\d\/]{2})?KT)|VRB[\d\/]{2}KT)(?:\s[\d\/]{3}V[\d\/]{3})?)\s(?<is_cavok>CAVOK\s)?(?<visibility>[\d\/]{4}\s(?:\d{4}[A-Z]{1,2}\s)?)?(?<rvr>R[\d\/]{2}\w?\/P?[\d\/]{4}(?:V[\d\/]{4})?[DUN]?\s)*(?<weather_state>(?:\+|\-|V)?(?:MI|PR|BC|DR|BL|SH|TS|FZ)?[A-Z\/]{2}\s)*(?<clouds>NCD\s|NSC\s|VV[\d\/]{3}\s|(?:(?:FEW|BKN|SCT|OVC|\/{3})[\d\/]{0,3}(?:CB|TCU|\/{3})?\s)*)?(?<temperature>M?[\d\/]{2}\/M?[\d\/]{2}\s)(?<pressure>Q[\d\/]{4})\s?(?<remarks>.*)$/,
      wind: /^(?<direction>\d{3})(?<nominalSpeed>\d{2,3})G?(?<gustSpeed>\d{2,3})?KT\s?(?<variationStart>\d{3})?V?(?<variationEnd>\d{3})?$/
    }
  };
  static splitMetar(metar: string) {
    return this.regex.ICAO.main.exec(metar)?.groups || {};
  }

  static splitMetarOnRunway(splittedMetar: any, runwayHeading: number, magVariation: number): SplittedMetar {
    if(splittedMetar.wind) {
      splittedMetar = this.transformWind(splittedMetar.wind, magVariation ?? 0, runwayHeading, splittedMetar);
    }
    return splittedMetar;
  }

  private transformDatetime(metarTime: string): Date {
    const date = new Date();
    date.setUTCDate(+metarTime.substring(0, 2));
    date.setUTCHours(+metarTime.substring(2, 4));
    date.setUTCMinutes(+metarTime.substring(4, 6));
    return date;
  };

  private static getWindDelta(magWindDirection: number, runwayHeading: number): number {
    let windDelta = magWindDirection - runwayHeading;
    if (windDelta > 180) {
      windDelta -= 360;
    }
    return windDelta;
  };

  private static getHeadWind(windDelta: number, windSpeed: number): number {
    const relativeWindDirection = windDelta < 0 ? windDelta + 360 : windDelta;
    return Math.ceil(
      Math.cos(relativeWindDirection * (Math.PI / 180)) * windSpeed,
    );
  };

  private static getLeftWind(windDelta: number, windSpeed: number): number {
    const relativeWindDirection = windDelta < 0 ? windDelta + 360 : windDelta;
    return Math.ceil(
      Math.sin(relativeWindDirection * (Math.PI / 180)) * windSpeed,
    );
  };

  private static transformWind(metarWind: string, magVariation: number, runwayHeading: number, splittedMetar: SplittedMetar): SplittedMetar {
    const groups: any = this.regex.ICAO.wind.exec(metarWind)?.groups || '';
    const magWindDirection = magVariation + +groups.direction;
    const windDelta = this.getWindDelta(magWindDirection, runwayHeading);

    splittedMetar.trueWindDirection = groups.direction;
    splittedMetar.nominalWindSpeed = +groups.nominalSpeed;
    splittedMetar.gustSpeed = +groups.gustSpeed;
    splittedMetar.magWindDirection = magWindDirection;
    splittedMetar.headWindSpeed = this.getHeadWind(windDelta, +groups.nominalSpeed);
    splittedMetar.leftWindSpeed = this.getLeftWind(windDelta, +groups.nominalSpeed);
    splittedMetar.windDelta = Math.abs(windDelta);

    return splittedMetar;
  };
}
