import { AnnotationModel } from './annotation';

export interface TextSegment {
  start: number;
  end: number;
  text: string;
  annotation?: AnnotationModel;
}