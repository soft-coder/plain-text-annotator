import {
  DOCUMENT,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  signal
} from '@angular/core';
import { PopoverAnchor } from './article-view-selector';

@Injectable()
export class AnnotationPopoverAnchor {
  private readonly document = inject(DOCUMENT);

  private readonly renderer: Renderer2;

  private  readonly _anchor = signal<PopoverAnchor | null>(null);

  readonly anchor = this._anchor.asReadonly();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.renderer.listen('document', 'scroll', () => {
      this.clearAnchor();
    });
  }

  calcSelectionAnchor(range: Range) {
    const clientRects = range.getClientRects();
    const anchor = this.calcAnchorPosition(
      clientRects[clientRects.length - 1],
    );
    this._anchor.set(anchor);
  }

  calcElementAnchor(element: HTMLElement) {
    const clientRects = element.getClientRects();
    const anchor = this.calcAnchorPosition(
      clientRects[clientRects.length - 1],
    );
    this._anchor.set(anchor);
  }

  clearAnchor() {
    this._anchor.set(null);
  }

  private calcAnchorPosition(rect: DOMRect): PopoverAnchor {
    const rootStyles = getComputedStyle(this.document.documentElement);
    const arrowSizeRem = parseFloat(rootStyles.getPropertyValue('--pta-size-arrow'));
    const spacedMdRem = parseFloat(rootStyles.getPropertyValue('--pta-space-md'));
    const rootFontSize = parseFloat(rootStyles.fontSize);
    const arrowSizePx = rootFontSize * arrowSizeRem;
    const spacedMdPx = rootFontSize * spacedMdRem;
    return {
      top: rect.bottom + arrowSizePx + 3,
      left: rect.right - spacedMdPx
    };
  }
}