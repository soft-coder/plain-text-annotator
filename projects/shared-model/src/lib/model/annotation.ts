export interface AnnotationModel {
  id: number;
  start: number;
  end: number;
  text: string;
  prefix: string;
  suffix: string;
  color: string;
  comment?: string;
}