import { SplittedMetar } from "src/atis/interfaces/splittedMetar.interface";

export class ParamsResolver {

  resolveParamsBasedOnMetar(paramsTree: any, splittedMetar: SplittedMetar): boolean {
    return this.resolveTree(paramsTree, splittedMetar);
  }

  private resolveTree(node: any, splittedMetar: SplittedMetar, type: string = 'some'): boolean {
    
    return (Object.keys(node) as any[])[type as any]((childNode: any) => {
      if (typeof node[childNode] === 'object') {
        const operatorMap: any = {
          and: 'every',
          or: 'some',
        };
        return this.resolveTree(node[childNode], splittedMetar, operatorMap[childNode]);
      } else {
        return this.resolveLeaf(childNode, node[childNode], splittedMetar);
      }
    });
  };

  private resolveLeaf(type: string, condition: string, splittedMetar: SplittedMetar): boolean {
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

  private checkGreaterThan(type: string, condition: string, splittedMetar: any): boolean {
    return +splittedMetar[type] > +condition;
  };

  private checkLessThan(type: string, condition: string, splittedMetar: any): boolean {
    return +splittedMetar[type] < +condition;
  };

  private checkEqualsTo(type: string, condition: string, splittedMetar: any): boolean {
    return splittedMetar[type] == condition;
  };
}
