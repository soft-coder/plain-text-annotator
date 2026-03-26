export interface AnnotationModel {
  id: string;
  start: number;
  end: number;
  text: string;
  prefix: string;
  suffix: string;
  color: string;
  comment?: string;
}