export function splitIntoLines(input: string): string[] {
  var lines = input.split('\n');
  if (lines[lines.length - 1].trim().length == 0) {
    lines = lines.slice(0, lines.length - 1);
  }
  return lines;
}
