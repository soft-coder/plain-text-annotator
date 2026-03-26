import { TestBed } from '@angular/core/testing';
import { AnnotationModel, ArticleModel } from '@pta/model';
import { IdGenerator } from '@pta/util';
import { expect, Mock } from 'vitest';
import { ArticleState } from '../state/article-state';

import { ArticleFacade } from './article-facade';
import { signal, WritableSignal } from '@angular/core';

describe('ArticleFacade', () => {
  let service: ArticleFacade;
  let articleStateSpy: Partial<ArticleState>;
  let articlesSignalStub: WritableSignal<ArticleModel[]>;
  let idGeneratorSpy: IdGenerator;

  beforeEach(() => {
    articlesSignalStub = signal<ArticleModel[]>([]);
    articleStateSpy = {
      articles: articlesSignalStub.asReadonly(),
      update: vi.fn()
    };
    idGeneratorSpy = {
      generate: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ArticleState,
          useValue: articleStateSpy
        },
        {
          provide: IdGenerator,
          useValue: idGeneratorSpy
        },
      ]
    });
    service = TestBed.inject(ArticleFacade);
  });

  it('should create a new article', () => {
    const title = 'New Article';
    const content = 'Some content here';
    const newId = 'generated-id-123';
    const initialArticles: ArticleModel[] = [];
    const generateSpy = idGeneratorSpy.generate as Mock;
    generateSpy.mockReturnValue(newId);

    service.create(title, content);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = updateSpy.mock.calls[0][0];
    const result = updateFn(initialArticles) as ArticleModel[];

    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    const createdArticle = result[0];
    expect(createdArticle).toEqual({
      id: newId,
      title: title,
      content: content,
      annotations: []
    });
    expect(result).not.toBe(initialArticles);
  });

  it('should return articles from state', () => {
    let articles = service.articles;

    expect(articles()).toBe(articlesSignalStub());
  });

  it('should return articlePreview from state', () => {
    const id = '1';
    const title = 'title 1';
    const annotationCount = 10;
    articlesSignalStub.set([
      {
        id,
        title,
        annotations: new Array(annotationCount) as unknown as AnnotationModel[]
      } as ArticleModel
    ]);

    let articlePreviews = service.articlePreviews();

    expect(articlePreviews[0].id).toBe(id);
    expect(articlePreviews[0].title).toBe(title);
    expect(articlePreviews[0].annotationsCount).toBe(annotationCount);
  });

  it('should create article', () => {
    service.create('title', 'content');
    TestBed.tick();

    expect(articleStateSpy.update).toHaveBeenCalled();
  });


  it('should update content', () => {
    const targetId = '1';
    const otherId = '2';
    const newContent = 'Updated content';
    let untouchedContent = 'Untouched content';

    const articleModels: ArticleModel[] = [
      { id: targetId, content: 'Old', annotations: [] } as any,
      { id: otherId, content: untouchedContent, annotations: [] } as any,
    ];

    service.updateContent(targetId, newContent);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = vi.mocked(updateSpy).mock.calls[0][0];
    const result = updateFn(articleModels) as ArticleModel[];

    const updated = result.find(a => a.id === targetId);
    const untouched = result.find(a => a.id === otherId);
    expect(updated?.content).toBe(newContent);
    expect(untouched?.content).toBe(untouchedContent);
    expect(result).not.toBe(articleModels);
  });



  it('should recover annotation indices when article content updated', () => {
    const targetId = '1';
    const oldContent = 'The quick brown fox';
    const newContent = 'NEWS: The quick brown fox';
    const articleModels: ArticleModel[] = [{
      id: targetId,
      content: oldContent,
      annotations: [{
        text: 'brown',
        prefix: 'quick ',
        suffix: ' fox',
        start: 10, // Старый индекс
        end: 15
      }]
    } as any];

    service.updateContent(targetId, newContent);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = vi.mocked(updateSpy).mock.calls[0][0];
    const result = updateFn(articleModels) as ArticleModel[];

    const updatedAnn = result[0].annotations[0];
    expect(updatedAnn.start).toBe(16);
    expect(newContent.substring(updatedAnn.start, updatedAnn.end)).toBe('brown');
  });

  it('should delete article', () => {
    const targetId = '1';
    const otherId = '2';
    const articles: ArticleModel[] = [
      { id: targetId } as unknown as ArticleModel,
      { id: otherId } as unknown as ArticleModel
    ];

    service.delete(targetId);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = vi.mocked(updateSpy).mock.calls[0][0];
    const result = updateFn(articles) as ArticleModel[];

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(otherId);
  });

  it('should add annotation to article', () => {
    const targetId = '1';
    let text = `annotation`;
    let content = `Test ${text} add by addAnnotation`;
    const start = content.indexOf(text);
    const end = start + text.length;
    const color = 'color';
    const articles: ArticleModel[] = [
      {
        id: targetId,
        content: content,
        annotations: [{} as AnnotationModel]
      } as unknown as ArticleModel,
      {} as unknown as ArticleModel
    ];
    const generateStub = idGeneratorSpy.generate as Mock;
    const annotationId = 'annotationId';
    generateStub.mockReturnValue(annotationId)

    service.addAnnotation(targetId, start, end, color);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = vi.mocked(updateSpy).mock.calls[0][0];
    const result = updateFn(articles) as ArticleModel[];

    expect(result.length).toBe(2);
    expect(result[0].annotations.length).toBe(2);
    expect(result[0].annotations[1].id).toBe(annotationId);
    expect(result[0].annotations[1].text).toBe(text);
    expect(result[0].annotations[1].start).toBe(start);
    expect(result[0].annotations[1].end).toBe(end);
    expect(result[0].annotations[1].color).toBe(color);
    expect(idGeneratorSpy.generate).toHaveBeenCalledTimes(1);
  });


  it('should delete annotation from article', () => {
    const targetArticleId = 'target-article';
    const annIdToDelete = 'annotation-to-delete';
    const annIdToKeep = 'annotation-to-keep';
    const initialArticles: ArticleModel[] = [
      {
        id: targetArticleId,
        annotations: [
          { id: annIdToDelete } as AnnotationModel,
          { id: annIdToKeep } as AnnotationModel
        ]
      } as ArticleModel,
      { id: 'other-article', annotations: [] } as any
    ];

    service.deleteAnnotation(targetArticleId, annIdToDelete);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = updateSpy.mock.calls[0][0];
    const result = updateFn(initialArticles) as ArticleModel[];

    const updatedArticle = result.find(a => a.id === targetArticleId);
    const otherArticle = result.find(a => a.id === 'other-article');
    expect(updatedArticle?.annotations).toHaveLength(1);
    expect(updatedArticle?.annotations[0].id).toBe(annIdToKeep);
    expect(otherArticle).toEqual(initialArticles[1]);
    expect(updatedArticle).not.toBe(initialArticles[0]);
  });

  it('should update annotation color', () => {
    const targetArticleId = 'target-article-id';
    const targetAnnotationId = 'target-annotation-id';
    const targetAnnotationText = 'Should keep this text';
    const oldColor = 'blue';
    const newColor = 'red';
    let otherAnnotationId = 'other-annotation-id';

    let otherAnnotationColor = 'Should keep this color';
    const initialArticles: ArticleModel[] = [
      {
        id: targetArticleId,
        annotations: [
          {
            id: targetAnnotationId,
            color: oldColor,
            text: targetAnnotationText
          } as AnnotationModel,
          {
            id: otherAnnotationId,
            color: otherAnnotationColor
          } as unknown as ArticleModel
        ]
      } as ArticleModel,
      { } as unknown as ArticleModel
    ];

    service.updateAnnotationColor(targetArticleId, targetAnnotationId, newColor);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = updateSpy.mock.calls[0][0];
    const result = updateFn(initialArticles) as ArticleModel[];

    const targetArticle = result.find(a => a.id === targetArticleId);
    const updatedAnn = targetArticle?.annotations.find(a => a.id === targetAnnotationId);
    const untouchedAnn = targetArticle?.annotations.find(a => a.id === otherAnnotationId);
    expect(updatedAnn?.color).toBe(newColor);
    expect(updatedAnn?.text).toBe(targetAnnotationText);
    expect(untouchedAnn?.color).toBe(otherAnnotationColor);
    expect(updatedAnn).not.toBe(initialArticles[0].annotations[0]);
    expect(targetArticle).not.toBe(initialArticles[0]);
  });

  it('should update annotation comment', () => {
    const targetArticleId = 'target-article-id';
    const targetAnnotationId = 'annotation-1';
    let targetAnnotationText = 'Should keep this text';
    let targetAnnotationColor = 'Should keep this color';
    const newComment = 'New comment';

    const initialArticles: ArticleModel[] = [
      {
        id: targetArticleId,
        annotations: [
          {
            id: targetAnnotationId,
            text: targetAnnotationText,
            color: targetAnnotationColor,
            comment: 'Old comment'
          } as AnnotationModel,
          { } as unknown as AnnotationModel
        ]
      } as ArticleModel
    ];

    service.updateAnnotationComment(targetArticleId, targetAnnotationId, newComment);
    const updateSpy = articleStateSpy.update as Mock;
    const updateFn = updateSpy.mock.calls[0][0];
    const result = updateFn(initialArticles) as ArticleModel[];

    const targetArticle = result.find(a => a.id === targetArticleId);
    const updatedAnn = targetArticle?.annotations.find(a => a.id === targetAnnotationId);

    expect(updatedAnn?.comment).toBe(newComment);
    expect(updatedAnn?.text).toBe(targetAnnotationText);
    expect(updatedAnn?.color).toBe(targetAnnotationColor);
    expect(updatedAnn).not.toBe(initialArticles[0].annotations[0]);
  });

});
