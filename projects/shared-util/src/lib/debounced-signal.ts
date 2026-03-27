import { signal, effect, Signal, WritableSignal } from '@angular/core';

export function debounceSignal<T>(
  source: WritableSignal<T>,
  delay: number
): Signal<T> {
  const debounced = signal(source());
  effect((onCleanup) => {
    const value = source();
    const timeout = setTimeout(() => debounced.set(value), delay);
    onCleanup(() => clearTimeout(timeout));
  });
  return debounced;
}