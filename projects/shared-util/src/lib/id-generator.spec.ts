import { TestBed } from '@angular/core/testing';

import { IdGenerator } from './id-generator';

describe('IdGenerator', () => {
  let service: IdGenerator;

  const mockId = 'gen-id';
  const mockRandomUUID = vi.fn(() => mockId);

  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: mockRandomUUID },
    writable: true,
    configurable: true,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate id', () => {
    const genId = service.generate();

    expect(genId).toBe(mockId);
  });
});
