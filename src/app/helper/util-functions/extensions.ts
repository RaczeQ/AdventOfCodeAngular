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
