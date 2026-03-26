import { TestBed } from '@angular/core/testing';
import { ArticleModel } from '@pta/model';
import { LocalStorage } from '@pta/util';

import { ArticleStorage } from './article-storage';

describe('ArticleStorage', () => {
  let service: ArticleStorage;

  let localStorageSpy: LocalStorage;
  let articleId = 1;

  beforeEach(() => {
    localStorageSpy = {
      getItem: vi.fn().mockReturnValue([{id: articleId}]),
      setItem: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStorage,
          useValue: localStorageSpy
        }
      ]
    });
    service = TestBed.inject(ArticleStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load data', () => {
    const data = service.load();

    expect(data[0].id).toBe(articleId);
  });

  it('should save data', () => {
    let articles: ArticleModel[] = [];

    service.save(articles);

    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });
});
