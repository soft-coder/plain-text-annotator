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
    const endNode = range.endContainer;
    let endElement: HTMLElement;
    if (endNode.nodeType === Node.TEXT_NODE) {
      endElement = endNode.parentElement!;
    } else {
      endElement = endNode as HTMLElement;
    }
    const anchor = this.calcAnchorPosition(
      clientRects[clientRects.length - 1],
      endElement
    );
    this._anchor.set(anchor);
  }

  calcElementAnchor(element: HTMLElement) {
    const clientRects = element.getClientRects();
    const anchor = this.calcAnchorPosition(
      clientRects[clientRects.length - 1],
      element
    );
    this._anchor.set(anchor);
  }

  clearAnchor() {
    this._anchor.set(null);
  }

  private calcAnchorPosition(rect: DOMRect, element: Element): PopoverAnchor {
    const computedStyle = getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const rootStyles = getComputedStyle(this.document.documentElement);
    const arrowSizeRem = parseFloat(rootStyles.getPropertyValue('--pta-size-arrow'));
    const rootFontSize = parseFloat(rootStyles.fontSize);
    const arrowSizePx = rootFontSize * arrowSizeRem;
    const gapTop = (lineHeight - fontSize) / 2;
    return {
      top: rect.top + gapTop + arrowSizePx,
      left: rect.left
    };
  }
}