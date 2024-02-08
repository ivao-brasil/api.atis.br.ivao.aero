export interface SplittedMetar {
  wind?: Wind,
  time?: Date,
  visibility?: Visibility,
  airport?: string,
  isAuto?: string,
  weatherConditions?: WeatherCondition[],
  temperature?: number,
  drewPoint?: number,
  dayLightPeriod?: 'DAYLIGHT' | 'NIGHTTIME'
  altimeter?: string,
  remarks?: string[]
}

export interface Wind {
  trueWindDirection?: string,
  magWindDirection?: number,
  nominalWindSpeed?: number,
  gustSpeed?: number,
  headWindSpeed?: number,
  leftWindSpeed?: number,
  windDelta?: number,
  variationStart?: number,
  variationEnd?: number
}

export interface Visibility {
  horizontalVisibility?: {
    general: number,
    directional: {
      direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW',
      visibility: number
    }[]
  },
  rvr?: {
    runway: string,
    rvr: number,
    trend: 'D' | 'U' | 'N'
  }[],
  isCavok: boolean,
  cloudLayers: {
    type: 'NCD' | 'NSC' | 'VV' | 'FEW' | 'BKN' | 'SCT' | 'OVC',
    height: number
  }[]
}

export interface WeatherCondition {
  intensity: string,
  descriptor: string,
  phenomena: string
}