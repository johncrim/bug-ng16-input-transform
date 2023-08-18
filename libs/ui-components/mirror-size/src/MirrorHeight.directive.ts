/*!
 * Copyright 2023 Fintellect Inc. All Rights Reserved.
 */

import { Directive, Input, OnChanges } from '@angular/core';
import { resizeObservable, skipSizeZero } from '@myorg/util';
import { auditTime, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';

/**
 * Continually updates the height of the host element to match the height of a source element.
 */
@Directive({
  selector: '[ui-mirror-height]',
  standalone: true,
  exportAs: 'ui-mirror-height'
})
export class MirrorHeightDirective
  implements OnChanges {

  /** The element to watch the height of, and match. */
  @Input({ alias: 'ui-mirror-height', required: true })
  public source!: Element;

  /** Returns the {@link Observable} for the height of {@link source}. */
  public get sourceHeight$(): Observable<number> {
    const height$ = this._height$;
    if (!height$) throw new Error('height$ not initialized');
    return height$;
  }
  private _height$?: Observable<number>;

  ngOnChanges() {
    const sourceElement = this.source;
    if (sourceElement) {
      const height$ = resizeObservable(sourceElement, { box: 'border-box' }).pipe(
        skipSizeZero(),
        auditTime(80), // Give size time to stabilize, and prevent "ResizeObserver loop limit exceeded"
        // Currently Safari doesn't support borderBoxSize, so fallback to directly reading the element's height
        map(resizeEntry => resizeEntry.borderBoxSize?.[0].blockSize ?? (resizeEntry.target as HTMLElement).offsetHeight),
        startWith((sourceElement as HTMLElement).offsetHeight),
        distinctUntilChanged(),
        shareReplay(1)
        // map(h => h + 'px')
      );
      // TODO: Update CSS height
      this._height$ = height$;
    }
  }

}
