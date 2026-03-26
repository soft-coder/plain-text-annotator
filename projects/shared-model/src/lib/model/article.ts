import { AnnotationModel } from './annotation';

export interface ArticleModel {
  id: string;
  title: string;
  content: string;
  annotations: AnnotationModel[];
}