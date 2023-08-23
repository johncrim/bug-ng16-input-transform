/*!
 * Copyright 2023 Fintellect Inc. All Rights Reserved.
 */

import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { coerceElement, resizeObservable, skipSizeZero } from '@myorg/util';
import { auditTime, distinctUntilChanged, map, Observable, shareReplay, startWith, tap } from 'rxjs';

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
  public set source(v: HTMLElement | ElementRef<HTMLElement>) {
    this._source = coerceElement(v);
  }
  public get source(): HTMLElement {
    if (!this._source) {
      throw new Error('ui-mirror-height not set');
    }
    return this._source;
  }
  private _source?: HTMLElement;

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
        //skipSizeZero(),
        //auditTime(80), // Give size time to stabilize, and prevent "ResizeObserver loop limit exceeded"
        // Currently Safari doesn't support borderBoxSize, so fallback to directly reading the element's height
        map((resizeEntry: ResizeObserverEntry) => resizeEntry.borderBoxSize?.[0].blockSize ?? resizeEntry.contentRect.height),
        distinctUntilChanged(),
        tap(h => console.log('mirror-height : ', h)),
        shareReplay(1)
        // map(h => h + 'px')
      );
      // TODO: Update CSS height
      this._height$ = height$;
    }
  }

}
