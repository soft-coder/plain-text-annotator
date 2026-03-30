import { InjectionToken } from '@angular/core';

export interface ColorConfig {
  readonly presets: readonly string[];
  readonly defaultColor: string;
}

const ANNOTATION_COLORS_VALUE: ColorConfig = {
  presets: [
    '#D32F2F',
    '#1976D2',
    '#388E3C',
    '#FBC02D',
    '#7B1FA2',
  ],
  defaultColor: '#FBC02D'
};


export const ANNOTATION_COLORS = new InjectionToken<ColorConfig>('ColorConfig', {
  providedIn: 'root',
  factory: () => ANNOTATION_COLORS_VALUE
});