import { SplittedMetar, Wind } from "src/interfaces/splitted-metar.interface";
import { MetarResolver } from "../metar-resolver/metar-resolver";
export class ParamsResolver {

  private static readonly customResolver: any = {
    customHeadWindSpeed({ wind }: SplittedMetar, magHeading: number) {
      if(!wind || !wind.magWindDirection || !wind.nominalWindSpeed) return 0;
      return MetarResolver.getHeadWind(MetarResolver.getWindDelta(wind.magWindDirection, magHeading), wind.nominalWindSpeed);
    }
  }

  static resolveParamsBasedOnMetar(paramsTree: any, splittedMetar: SplittedMetar): boolean {
    return this.resolveTree(paramsTree, splittedMetar);
  }

  private static  resolveTree(node: any, splittedMetar: SplittedMetar, type: string = 'some'): boolean {
    
    return (Object.keys(node) as any[])[type as any]((childNode: any) => {
      if (typeof node[childNode] === 'object') {
        const operatorMap: any = {
          and: 'every',
          or: 'some',
        };
        return this.resolveTree(node[childNode], splittedMetar, operatorMap[childNode.split('_')[0]]);
      } else {
        return this.resolveLeaf(childNode, node[childNode], splittedMetar);
      }
    });
  };

  private static resolveLeaf(type: string, condition: string, splittedMetar: SplittedMetar): boolean {
    const [operator, value] = /(^[\<\=\>][\<\=\>]?)?(.+)+/
      .exec(condition)!
      .slice(1, 3);
    if (operator === '>') {
      return this.checkGreaterThan(type, value, splittedMetar);
    }
    if (operator === '<') {
      return this.checkLessThan(type, value, splittedMetar);
    }
    if (operator == undefined) {
      return this.checkEqualsTo(type, value, splittedMetar);
    }
    if (operator === '>=') {
      return this.checkGreaterThan(type, value, splittedMetar) || this.checkEqualsTo(type, value, splittedMetar);
    }
    if (operator === '<=') {
      return this.checkLessThan(type, value, splittedMetar) || this.checkEqualsTo(type, value, splittedMetar);
    }
    return false;
  };

  private static checkGreaterThan(type: string, condition: string, splittedMetar: any): boolean {
    const value = this.getMetarValue(type,splittedMetar);
    if(value == null || isNaN(value)) return false;
    return +value > +condition;
  };

  private static checkLessThan(type: string, condition: string, splittedMetar: any): boolean {
    const value = this.getMetarValue(type,splittedMetar);
    if(value == null || isNaN(value)) return false;
    return +value < +condition;
  };

  private static checkEqualsTo(type: string, condition: string, splittedMetar: any): boolean {
    const value = this.getMetarValue(type,splittedMetar);
    if(value == null) return false;
    return value == condition;
  };

  private static getMetarValue(type: string, splittedMetar: any): any {
    const splittedType = type.split('.');

    let currentObj = splittedMetar;

    for (const key of splittedType) {
      if (key in this.customResolver) {
        return this.customResolver[key](splittedMetar, splittedType.at(-1));
      }
      if (currentObj.hasOwnProperty(key)) {
        currentObj = currentObj[key];
      } else {
        currentObj = null;
        break;
      }
    }
    return currentObj;
  }
}
