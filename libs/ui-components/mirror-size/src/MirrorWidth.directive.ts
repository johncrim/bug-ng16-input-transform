/*!
 * Copyright 2023 Fintellect Inc. All Rights Reserved.
 */

import { Directive, Input, OnChanges } from '@angular/core';
import { coerceElement, resizeObservable, skipSizeZero } from '@myorg/util';
import { auditTime, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';

@Directive({
  selector: '[ui-mirror-width]',
  standalone: true,
  exportAs: 'ui-mirror-width'
})
export class MirrorWidthDirective
  implements OnChanges {

  /** The element to watch the width of, and match. */
  @Input({ alias: 'ui-mirror-width', required: true, transform: coerceElement })
  public source!: HTMLElement;

  /** Returns the {@link Observable} for the width of {@link source}. */
  public get sourceWidth$(): Observable<number> {
    const width$ = this._width$;
    if (!width$) throw new Error('width$ not initialized');
    return width$;
  }
  private _width$?: Observable<number>;

  ngOnChanges() {
    const sourceElement = this.source;
    if (sourceElement) {
      const width$ = resizeObservable(sourceElement, { box: 'border-box' }).pipe(
        skipSizeZero(),
        auditTime(100), // Give size time to stabilize, and prevent "ResizeObserver loop limit exceeded"
        // Currently Safari doesn't support borderBoxSize, so fallback to directly reading the element's width
        map(resizeEntry => resizeEntry.borderBoxSize?.[0].inlineSize ?? (resizeEntry.target as HTMLElement).offsetWidth),
        startWith((sourceElement as HTMLElement).offsetWidth),
        distinctUntilChanged(),
        shareReplay(1)
        // map(w => w + 'px')
      );
      // TODO: Update CSS width
      this._width$ = width$;
    }
  }

}
