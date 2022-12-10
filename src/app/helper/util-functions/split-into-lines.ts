export function splitIntoLines(input: string): string[] {
  var lines = input.split('\n').map((l) => l.trim());
  if (lines[lines.length - 1].length == 0) {
    lines = lines.slice(0, lines.length - 1);
  }
  return lines;
}
