import { chunk } from './chunk';
import { sumNumbers } from './sum';

declare global {
  interface Array<T> {
    sum(): number;
  }
}

Array.prototype.sum = function (): number {
  return sumNumbers(this);
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
