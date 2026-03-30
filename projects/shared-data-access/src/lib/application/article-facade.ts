import { computed, inject, Injectable } from '@angular/core';
import { AnnotationModel, ArticleModel } from '@pta/model';
import { getContext, IdGenerator } from '@pta/util';
import { ArticleState } from '../state/article-state';

@Injectable({
  providedIn: 'root',
})
export class ArticleFacade {
  private state = inject(ArticleState);

  private idGenerator = inject(IdGenerator);

  readonly articles = this.state.articles;

  readonly articlePreviews = computed(() =>
    this.articles().map(({ id, title, annotations }) => ({
      id,
      title,
      annotationsCount: annotations.length
    }))
  );

  create(title: string, content: string): string {
    const article: ArticleModel = {
      id: this.idGenerator.generate(),
      title,
      content,
      annotations: []
    };
    this.state.update(articles => [...articles, article]);
    return article.id;
  }

  update(id: string, newTitle: string, newContent: string): void {
    this.state.update(articles => articles.map(article => {
      if (article.id !== id) {
        return article;
      }

      const validAnnotations = article.annotations
        .map(a => this.recoverAnnotationIndices(newContent, a))
        .filter((a): a is AnnotationModel => a !== null);

      return {
        id: article.id,
        title: newTitle,
        content: newContent,
        annotations: validAnnotations
      };
    }));
  }

  delete(id: string): void {
    this.state.update(articles => articles.filter(article => article.id !== id));
  }

  addAnnotation(articleId: string, start: number, end: number, color: string): string {
    let newId = this.idGenerator.generate();
    this.state.update(articles => articles.map(article => {
      if (article.id !== articleId){
        return article;
      }

      const text = article.content.substring(start, end);
      const { prefix, suffix } = getContext(article.content, start, end);


      const annotation: AnnotationModel = {
        id: newId,
        start,
        end,
        text,
        prefix,
        suffix,
        color
      };

      return {
        ...article,
        annotations:
        [...article.annotations, annotation]
      };
    }));
    return newId;
  }

  deleteAnnotation(articleId: string, annotationId: string): void {
    this.state.update(articles => articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          annotations: article.annotations.filter(a => a.id !== annotationId)
        }
      } else {
        return article;
      }
    }));
  }

  updateAnnotationColor(articleId: string, annotationId: string, color: string) {
    this.patchAnnotation(articleId, annotationId, { color });
  }

  updateAnnotationComment(articleId: string, annotationId: string, comment: string) {
    this.patchAnnotation(articleId, annotationId, { comment });
  }

  private patchAnnotation(
    articleId: string,
    annotationId: string,
    changes: Partial<AnnotationModel>
  ) {
    this.state.update(articles => articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          annotations: article.annotations.map(a =>
            a.id === annotationId ? {...a, ...changes} : a
          )
        }
      } else {
        return article
      }
    }));
  }


  private recoverAnnotationIndices(
    content: string,
    ann: AnnotationModel
  ): AnnotationModel | null {
    const fullMatch = `${ann.prefix}${ann.text}${ann.suffix}`;
    const index = content.indexOf(fullMatch);
    if (index !== -1) {
      const start = index + ann.prefix.length;
      return {
        ...ann,
        start,
        end: start + ann.text.length
      };
    }
    return content.substring(ann.start, ann.end) === ann.text ? ann : null;
  }
}
