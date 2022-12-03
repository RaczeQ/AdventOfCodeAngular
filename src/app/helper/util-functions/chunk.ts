export function chunk(input: any[], n: number): any[][] {
  return Array.from(Array(Math.ceil(input.length / n)), (_, i) =>
    input.slice(i * n, i * n + n)
  );
}
