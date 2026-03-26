import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  setItem<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  getItem<T>(key: string): T | null {
    let data = localStorage.getItem(key);
    return data === null ? null : JSON.parse(data);
  }
}
