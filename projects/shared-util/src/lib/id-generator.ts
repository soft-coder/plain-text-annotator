import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
