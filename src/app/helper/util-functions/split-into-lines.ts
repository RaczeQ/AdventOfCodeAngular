export function splitIntoLines(input: string, trim: boolean = false): string[] {
  var lines = input.split('\n');
  if (trim) {
    lines = lines.map((l) => l.trim());
  }
  if (lines[lines.length - 1].trim().length == 0) {
    lines = lines.slice(0, lines.length - 1);
  }
  return lines;
}
