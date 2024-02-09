import { MetarResolver } from "./metar-resolver";

describe('MetarResolver', () => {
  it('should be defined', () => {
    expect(new MetarResolver()).toBeDefined();
  });

  it('should split metar 1', () => {
    const metar = 'METAR SBGL 131000Z 31015G27KT 280V350 4000 1800N R10/P2000 +TSRA SN FEW005 FEW010CB SCT018 BKN025 10/03 Q0995 REDZ WS R10 W12/H75=';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SBGL',
      timestamp: '131000Z',
      is_auto: undefined,
      wind: '31015G27KT 280V350',
      is_cavok: undefined,
      visibility: '4000 1800N ',
      rvr: 'R10/P2000 ',
      weather_state: '+TSRA SN ',
      clouds: 'FEW005 FEW010CB SCT018 BKN025 ',
      temperature: '10/03 ',
      pressure: 'Q0995',
      remarks: 'REDZ WS R10 W12/H75=',
    });
  });

  it('should split metar 2', () => {
    const metar = 'METAR EKCH 302320Z 23013KT 9000 OVC006 07/06 Q1021 TEMPO BKN004';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'EKCH',
      timestamp: '302320Z',
      is_auto: undefined,
      wind: '23013KT',
      is_cavok: undefined,
      visibility: '9000 ',
      rvr: undefined,
      weather_state: undefined,
      clouds: 'OVC006 ',
      temperature: '07/06 ',
      pressure: 'Q1021',
      remarks: 'TEMPO BKN004',
    });
  });

  it('should split metar 3', () => {
    const metar = 'METAR LKPR 302330Z VRB01KT 0400 R24/0450N R30/0450N FZFG BKN002 M02/M03 Q1032 NOSIG';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'LKPR',
      timestamp: '302330Z',
      is_auto: undefined,
      wind: 'VRB01KT',
      is_cavok: undefined,
      visibility: '0400 ',
      rvr: 'R24/0450N R30/0450N ',
      weather_state: 'FZFG ',
      clouds: 'BKN002 ',
      temperature: 'M02/M03 ',
      pressure: 'Q1032',
      remarks: 'NOSIG',
    });
  });

  it('should split metar 4', () => {
    const metar = 'METAR SVBC 302303Z AUTO 28007KT NCD 29/24 Q1011';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SVBC',
      timestamp: '302303Z',
      is_auto: 'AUTO ',
      wind: '28007KT',
      is_cavok: undefined,
      visibility: undefined,
      rvr: undefined,
      weather_state: undefined,
      clouds: 'NCD ',
      temperature: '29/24 ',
      pressure: 'Q1011',
      remarks: '',
    });
  });

  it('should split metar 5', () => {
    const metar = 'METAR RJCM 302300Z 17007KT 9999 FEW005 BKN/// M11/M12 Q1024';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'RJCM',
      timestamp: '302300Z',
      is_auto: undefined,
      wind: '17007KT',
      is_cavok: undefined,
      visibility: '9999 ',
      rvr: undefined,
      weather_state: undefined,
      clouds: 'FEW005 BKN/// ',
      temperature: 'M11/M12 ',
      pressure: 'Q1024',
      remarks: '',
    });
  });

  it('should split metar 6', () => {
    const metar = 'METAR SBGR 302300Z 17002KT CAVOK 25/19 Q1015';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SBGR',
      timestamp: '302300Z',
      is_auto: undefined,
      wind: '17002KT',
      is_cavok: 'CAVOK ',
      visibility: undefined,
      rvr: undefined,
      weather_state: undefined,
      clouds: undefined,
      temperature: '25/19 ',
      pressure: 'Q1015',
      remarks: '',
    });
  });

  it('should split metar 7', () => {
    const metar = 'METAR SBGL 131000Z 31015G27KT 280V350 4000 1800N R10/P2000 +TSRA SN FEW005 FEW010CB SCT018 BKN025 10/03 Q0995 REDZ WS R10 W12/H75=';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SBGL',
      timestamp: '131000Z',
      is_auto: undefined,
      wind: '31015G27KT 280V350',
      is_cavok: undefined,
      visibility: '4000 1800N ',
      rvr: 'R10/P2000 ',
      weather_state: '+TSRA SN ',
      clouds: 'FEW005 FEW010CB SCT018 BKN025 ',
      temperature: '10/03 ',
      pressure: 'Q0995',
      remarks: 'REDZ WS R10 W12/H75=',
    });
  });

  it('should split metar 8', () => {
    const metar = 'METAR SBSP 280900Z 12004KT 8000 OVC008 19/17 Q1017';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SBSP',
      timestamp: '280900Z',
      is_auto: undefined,
      wind: '12004KT',
      is_cavok: undefined,
      visibility: '8000 ',
      rvr: undefined,
      weather_state: undefined,
      clouds: 'OVC008 ',
      temperature: '19/17 ',
      pressure: 'Q1017',
      remarks: '',
    });
  });

  it('should split metar 9', () => {
    const metar = 'METAR EKVG 302350Z AUTO 23015KT 9999 -RA OVC005/// 07/05 Q0995 RMK OVC011/// WIND SKEID VRB15G42KT';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'EKVG',
      timestamp: '302350Z',
      is_auto: 'AUTO ',
      wind: '23015KT',
      is_cavok: undefined,
      visibility: '9999 ',
      rvr: undefined,
      weather_state: '-RA ',
      clouds: 'OVC005/// ',
      temperature: '07/05 ',
      pressure: 'Q0995',
      remarks: 'RMK OVC011/// WIND SKEID VRB15G42KT',
    });
  });

  it('should split metar 10', () => {
    const metar = 'LIRZ 241750Z AUTO VRB02KT 9999 NCD 05/05 Q1029';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: undefined,
      airport: 'LIRZ',
      timestamp: '241750Z',
      is_auto: 'AUTO ',
      wind: 'VRB02KT',
      is_cavok: undefined,
      visibility: '9999 ',
      rvr: undefined,
      weather_state: undefined,
      clouds: 'NCD ',
      temperature: '05/05 ',
      pressure: 'Q1029',
      remarks: '',
    });
  });

  it('should split metar 11', () => {
    const metar = 'LCRA 241750Z 25007KT CAVOK 14/09 Q1017 NOSIG';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: undefined,
      airport: 'LCRA',
      timestamp: '241750Z',
      is_auto: undefined,
      wind: '25007KT',
      is_cavok: 'CAVOK ',
      visibility: undefined,
      rvr: undefined,
      weather_state: undefined,
      clouds: undefined,
      temperature: '14/09 ',
      pressure: 'Q1017',
      remarks: 'NOSIG',
    });
  });

  it('should split metar 12', () => {
    const metar = 'EHAM 241755Z 25015KT 9999 FEW043 09/06 Q1025 NOSIG';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: undefined,
      airport: 'EHAM',
      timestamp: '241755Z',
      is_auto: undefined,
      wind: '25015KT',
      is_cavok: undefined,
      visibility: '9999 ',
      rvr: undefined,
      weather_state: undefined,
      clouds: 'FEW043 ',
      temperature: '09/06 ',
      pressure: 'Q1025',
      remarks: 'NOSIG',
    });
  });

  it('should split metar 13', () => {
    const metar = 'METAR SNRU 310200Z AUTO /////KT ///V/// //// // ///////// ///// Q////=';
    const result = MetarResolver.splitMetar(metar, 'ICAO');
    
    expect(result).toEqual({
      type: 'METAR ',
      airport: 'SNRU',
      timestamp: '310200Z',
      is_auto: 'AUTO ',
      wind: '/////KT ///V///',
      is_cavok: undefined,
      visibility: '//// ',
      rvr: undefined,
      weather_state: '// ',
      clouds: '///////// ',
      temperature: '///// ',
      pressure: 'Q////',
      remarks: '=',
    });
  });

});
