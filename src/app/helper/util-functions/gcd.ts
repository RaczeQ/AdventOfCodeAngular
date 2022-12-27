export function gcd(a: number, b: number): number {
  while (b != 0) {
    var x = b;
    b = a % b;
    a = x;
  }
  return a;
}
