import { TestBed } from '@angular/core/testing';
import { ArticleModel } from '@pta/model';
import { ArticleStorage } from '../infrastructure/article-storage';

import { ArticleState } from './article-state';

describe('ArticleState', () => {
  let service: ArticleState;

  let articleStorageSpy: Partial<ArticleStorage>;
  const savedArticles: ArticleModel[] = [];

  beforeEach(() => {
    articleStorageSpy = {
      load: vi.fn().mockReturnValue(savedArticles),
      save: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ArticleStorage,
          useValue: articleStorageSpy
        },ArticleState
      ]
    });
    service = TestBed.inject(ArticleState);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should return articles', () => {
    let articles = service.articles();

    expect(articles).toBe(savedArticles);
  });

  it('should save articles', () => {
    const updatedArticles: ArticleModel[] = [];

    service.update(() => updatedArticles);
    TestBed.tick();

    expect(articleStorageSpy.save).toHaveBeenCalledWith(updatedArticles);
  });
});
