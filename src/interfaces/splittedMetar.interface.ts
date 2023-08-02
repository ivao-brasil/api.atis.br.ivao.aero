export interface SplittedMetar {
  windDelta?: number,
  trueWindDirection?: number,
  magWindDirection?: number,
  nominalWindSpeed?: number,
  gustSpeed?: number,
  headWindSpeed?: number,
  leftWindSpeed?: number
  rain?: string,
  timeOfDay?: number,
  dayOfWeek?: number,
  dayLightPeriod?: 'DAYLIGHT' | 'NIGHTTIME'
  baro?: string,
  visibility?: number,
  ceilHeight?: number,
  extraWeatherConditions?: string[]
}