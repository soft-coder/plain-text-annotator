export function getContext(text: string, start: number, end: number, length = 10) {
  return {
    prefix: text.substring(Math.max(0, start - length), start),
    suffix: text.substring(end, Math.min(text.length, end + length))
  };
}