import { ArticleModel } from '@pta/model';

export type ArticlePreviewModel = Pick<ArticleModel, 'id' | 'title'> & {
  annotationsCount: number;
};