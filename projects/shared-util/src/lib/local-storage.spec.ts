import { TestBed } from '@angular/core/testing';

import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  let service: LocalStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('check save and load methods', () => {
    const key = 'key';
    const data = {
      id: 1
    };

    it('should be save to local storage', () => {
      service.setItem(key, data);

      expect(localStorage.getItem(key)).toBe(JSON.stringify(data));
    });

    it('should be load from local storage', () => {
      service.setItem(key, data);
      const savedData = service.getItem<{ id: number }>(key);

      expect(savedData?.id).toBe(data.id);
    });

  })
});
