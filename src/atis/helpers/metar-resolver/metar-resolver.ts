import { SplittedMetar } from "src/atis/interfaces/splittedMetar.interface";
import { RunwayParam } from "src/runway-params/entities/runway-param.entity";

export class MetarResolver {
  private readonly mainRegex = /^(?<type>METAR|SPECI)\s(?<aerodrome>\w{4})\s(?<datetime>\d{6}Z)\s(?<wind>\/{5}|VRB\w{4}|\d{5}(?:KT|MPS|G\d{2}\w*)\s?(?:\d{3}V\d{3})?)\s?(?<visibility>(?:\d{4}|\d{2}SM)\s?(?:\d{4}\w{0,2}){0,4}\s?(?:R\d{2}\/\w\d{4})*)\s(?<rain>\+?\-?[A-Z]*\s)?\s?(?<clouds>(?:[A-Z]{3}\d{3}(?:CB|TCU)?\s?)*)\s?(?<temperature>M?\d{2})\/(?<drewpoint>M?\d{2})\s?(?<baro>\w{5})\s?(?<recentweather>RE\w{2})?\s(?<remarks>.*)?/;

  splitMetarOnRunway(metar: string, runway: RunwayParam): SplittedMetar {
    const groups = this.mainRegex.exec(metar)?.groups || {};
    let splittedMetar: any = {};
    if(groups.wind) {
      splittedMetar = this.transformWind(groups.wind, 0, runway.heading, splittedMetar);
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

  private getWindDelta(magWindDirection: number, runwayHeading: number): number {
    let windDelta = magWindDirection - runwayHeading;
    if (windDelta > 180) {
      windDelta -= 360;
    }
    return windDelta;
  };

  private getHeadWind(windDelta: number, windSpeed: number): number {
    const relativeWindDirection = windDelta < 0 ? windDelta + 360 : windDelta;
    return Math.ceil(
      Math.cos(relativeWindDirection * (Math.PI / 180)) * windSpeed,
    );
  };

  private getLeftWind(windDelta: number, windSpeed: number): number {
    const relativeWindDirection = windDelta < 0 ? windDelta + 360 : windDelta;
    return Math.ceil(
      Math.sin(relativeWindDirection * (Math.PI / 180)) * windSpeed,
    );
  };

  private transformWind(metarWind: string, magDeclination: number, runwayHeading: number, splittedMetar: SplittedMetar): SplittedMetar {
    const windRegex =
      /^(?<direction>\d{3})(?<nominalSpeed>\d{2,3})G?(?<gustSpeed>\d{2,3})?KT\s?(?<variationStart>\d{3})?V?(?<variationEnd>\d{3})?$/;
    const groups: any = windRegex.exec(metarWind)?.groups || '';
    const magWindDirection = magDeclination + +groups.direction;
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
