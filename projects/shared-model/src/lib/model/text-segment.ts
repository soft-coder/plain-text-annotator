import { AnnotationModel } from './annotation';

export interface TextSegment {
  text: string;
  annotation?: AnnotationModel;
}