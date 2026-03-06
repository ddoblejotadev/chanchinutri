let counter = 0;

export function randomUUID(): string {
  counter += 1;
  return `mock-uuid-${counter}`;
}
