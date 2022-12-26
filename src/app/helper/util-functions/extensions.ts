import { chunk } from './chunk';
import { multiplyNumbers } from './product';
import { sumNumbers } from './sum';

declare global {
  interface Array<T> {
    sum(): number;
    product(): number;
  }
}

Array.prototype.sum = function (): number {
  return sumNumbers(this);
};

Array.prototype.product = function (): number {
  return multiplyNumbers(this);
};

declare global {
  interface Array<T> {
    chunk(n: number): Array<Array<T>>;
  }
}

Array.prototype.chunk = function (n: number): Array<Array<any>> {
  return chunk(this, n);
};

declare global {
  interface ArrayConstructor {
    range(start: number, end: number): number[];
  }
}

Array.range = (start, end) =>
  Array.from({ length: end - start }, (v, k) => k + start);

declare global {
  interface Array<T> {
    findLast(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): T | undefined;
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number;
  }
}
