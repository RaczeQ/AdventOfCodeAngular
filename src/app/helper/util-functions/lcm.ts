export function lcm(a: number, b: number): number {
  var greater = a > b ? a : b;

  while (true) {
    if (greater % a == 0 && greater % b == 0) {
      return greater;
    }
    greater += 1;
  }
}
