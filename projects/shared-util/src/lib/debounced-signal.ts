import { signal, effect, Signal } from '@angular/core';

export function debounceSignal<T>(
  source: Signal<T>,
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