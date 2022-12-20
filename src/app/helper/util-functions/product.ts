export function multiplyNumbers(input: number[]): number {
  if (input.length == 0) {
    return 0;
  }
  return input.reduce((a, b) => a * b);
}
