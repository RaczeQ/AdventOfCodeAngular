export function sumNumbers(input: number[]): number {
  return input.reduce((a, b) => a + b);
}

declare global {
  interface Array<T> {
    sum(): number;
  }
}

Array.prototype.sum = function (): number {
  return sumNumbers(this);
};
