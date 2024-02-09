import { PartiallySplittedMetar } from "src/interfaces/partially-splitted-metar.interface";
import { SplittedMetar, TimeInformation, Visibility, WeatherCondition, Wind } from "src/interfaces/splitted-metar.interface";

export class MetarResolver {
  private static readonly dataExpressions: {ICAO: any, FAA: any} = {
    ICAO: {
      main: /^(?<type>METAR\s|SPECI\s)?(?<airport>\w{4})\s(?<timestamp>\d{6}Z)\s(?<is_auto>AUTO\s)?(?<wind>(?:(?:P?[\d\/]{5}(?:G[\d\/]{2})?KT)|VRB[\d\/]{2}KT)(?:\s[\d\/]{3}V[\d\/]{3})?)\s(?<is_cavok>CAVOK\s)?(?<visibility>[\d\/]{4}\s(?:\d{4}[A-Z]{1,2}\s)?)?(?<rvr>R[\d\/]{2}\w?\/P?[\d\/]{4}(?:V[\d\/]{4})?[DUN]?\s)*(?<weather_state>(?:(?:\+|\-|V)?(?:MI|PR|BC|DR|BL|SH|TS|FZ)?[A-Z\/]{2}\s)*)?(?<clouds>NCD\s|NSC\s|VV[\d\/]{3}\s|(?:(?:FEW|BKN|SCT|OVC|\/{3})[\d\/]{0,3}(?:CB|TCU|\/{3})?\s)*)?(?<temperature>M?[\d\/]{2}\/M?[\d\/]{2}\s)(?<pressure>Q[\d\/]{4})\s?(?<remarks>.*)$/,
      wind: /^(?<direction>(?:VRB|\d{3}|\/{3}))(?<nominal_speed>P?[\d\/]{2})G?(?<gust_speed>P?[\d\/]{2})?KT\s?(?:(?<variation_start>[\d\/]{3}))?V?(?:(?<variation_end>[\d\/]{3}))?$/,
      temperature: /(?<temperature>M?\d{2})\/(?<drewPoint>M?\d{2})/
    },
    FAA: {
      main: /.*/,
      wind: /^(?<direction>\d{3})(?<nominalSpeed>\d{2,3})G?(?<gustSpeed>\d{2,3})?KT\s?(?<variationStart>\d{3})?V?(?<variationEnd>\d{3})?$/
    }
  };
  static splitMetar(metar: string, type: 'ICAO' | 'FAA'): PartiallySplittedMetar {
    return this.dataExpressions[type].main.exec(metar)?.groups || {};
  }

  static processSplittedMetar(partiallySplittedMetar: PartiallySplittedMetar, runwayHeading: number, magVariation: number, type: 'ICAO' | 'FAA', sunRise: Date, sunSet: Date): SplittedMetar {
    const processedMetar: SplittedMetar = this.processMetarMainInfo(partiallySplittedMetar, type);
    processedMetar.wind = this.transformWind(partiallySplittedMetar.wind!, magVariation ?? 0, runwayHeading);
    processedMetar.time = this.transformDatetime(partiallySplittedMetar.timestamp!, sunRise, sunSet);
    processedMetar.weatherConditions = this.transformWeatherConditions(partiallySplittedMetar.weather_state!);
    processedMetar.visibility = this.transformVisibility(partiallySplittedMetar.visibility!, partiallySplittedMetar.rvr!, partiallySplittedMetar.clouds!, !!partiallySplittedMetar.is_cavok);
    return processedMetar;
  }

  private static transformDatetime(metarTime: string, sunRise: Date, sunSet: Date): TimeInformation {
    const date = new Date();
    date.setUTCDate(+metarTime.substring(0, 2));
    date.setUTCHours(+metarTime.substring(2, 4));
    date.setUTCMinutes(+metarTime.substring(4, 6));
    return {
      day: +metarTime.substring(0, 2),
      hour: +metarTime.substring(2, 4),
      minute: +metarTime.substring(4, 6),
      time: date,
      dayLightPeriod: date.getUTCHours() >= sunRise.getUTCHours() && date.getUTCHours() < sunSet.getUTCHours() ? 'DAYLIGHT' : 'NIGHTTIME',
    };
  };

  private static transformVisibility(visibility: string, rvr: string, clouds: string, isCavok: boolean): Visibility {
    if(isCavok) return { isCavok: true, cloudLayers: [] };
    const visibilitiesAsArray = visibility.trim().split(' ');
    const visibilityGroup = {
      general: +visibilitiesAsArray[0],
      directional: visibilitiesAsArray.slice(1).map((directionalVisibility: string): { direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW', visibility: number } => ({
        direction: directionalVisibility.substring(directionalVisibility.length - 2) as 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW',
        visibility: +directionalVisibility.substring(0, directionalVisibility.length - 2),
      })),
    };
    const rvrGroup = rvr?.trim().split(' ').map((rvr: string): { runway: string, rvr: number, trend: 'D' | 'U' | 'N' } => ({
      runway: rvr.substring(1, 3),
      rvr: +rvr.substring(3, 7),
      trend: rvr.substring(7) as 'D' | 'U' | 'N',
    })) || undefined;
    const cloudLayers = clouds.trim().split(' ').map((cloudLayer: string): { type: 'NCD' | 'NSC' | 'VV' | 'FEW' | 'BKN' | 'SCT' | 'OVC', height: number } => {
      const cloudType = cloudLayer.substring(0, 3);
      return {
        type: cloudType as 'NCD' | 'NSC' | 'VV' | 'FEW' | 'BKN' | 'SCT' | 'OVC',
        height: cloudLayer.substring(3) === '///' ? 0 : +cloudLayer.substring(3),
      };
    });
    return {
      horizontalVisibility: visibilityGroup,
      rvr: rvrGroup,
      isCavok: isCavok,
      cloudLayers: cloudLayers,
    };
  }

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

  private static processMetarMainInfo(partialMetar: PartiallySplittedMetar, type: 'ICAO' | 'FAA'): SplittedMetar {
    const temperatureGroup = this.dataExpressions[type].temperature.exec(partialMetar.temperature);
    return {
      airport: partialMetar.airport,
      isAuto: partialMetar.is_auto,
      temperature: temperatureGroup?.groups?.temperature.startsWith('M') ? +`-${temperatureGroup?.groups?.temperature.substring(1)}` : +temperatureGroup?.groups?.temperature,
      drewPoint: temperatureGroup?.groups?.drewPoint.startsWith('M') ? +`-${temperatureGroup?.groups?.drewPoint.substring(1)}` : +temperatureGroup?.groups?.drewPoint,
      altimeter: partialMetar.pressure?.substring(1),
    };
  }

  private static transformWind(metarWind: string, magVariation: number, runwayHeading: number): Wind | undefined {
    const groups: any = this.dataExpressions.ICAO.wind.exec(metarWind)?.groups || '';
    if(groups.direction === '///') return undefined;
    let magWindDirection = undefined,
        magVariationStart = undefined,
        magVariationEnd = undefined,
        windDelta = 0;
    if(groups.direction !== 'VRB'){
      magWindDirection = this.applyMagVariation(magVariation, +groups.direction);
      windDelta = this.getWindDelta(magWindDirection, runwayHeading);
      if(groups.variationStart && groups.variationEnd){
        magVariationStart = this.applyMagVariation(magVariation, +groups.variationStart);
        magVariationEnd = this.applyMagVariation(magVariation, +groups.variationEnd);
      }
    }

    return {
      trueWindDirection: groups.direction,
      nominalWindSpeed: +groups.nominal_speed,
      gustSpeed: +groups.gustSpeed,
      magWindDirection: magWindDirection,
      headWindSpeed: groups.direction !== 'VRB' ? this.getHeadWind(windDelta, +groups.nominal_speed) : 0,
      leftWindSpeed: groups.direction !== 'VRB' ? this.getLeftWind(windDelta, +groups.nominal_speed) : 0,
      windDelta: Math.abs(windDelta),
      variationStart: magVariationStart,
      variationEnd: magVariationEnd
    };
  };

  private static transformWeatherConditions(weatherString: string): WeatherCondition[] | undefined {
    return weatherString?.trim().split(' ').map<WeatherCondition>((weatherCondition: string): WeatherCondition => ({
      intensity: weatherCondition.charAt(0),
      descriptor: weatherCondition.substring(1, 3),
      phenomena: weatherCondition.substring(3),
    })) || undefined;
  }

  private static applyMagVariation(magVariation: number, trueDirection: number): number {
    let magWindDirection = trueDirection + magVariation;
    if(magWindDirection > 360) magWindDirection -= 360;
    if(magWindDirection < 0) magWindDirection += 360;
    return magWindDirection;
  }
}
