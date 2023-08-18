/*!
 * Copyright 2021 Fintellect, Inc. All Rights Reserved.
 */

import { ElementRef } from '@angular/core';
import { map, NEVER, Observable, OperatorFunction } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, startWith } from 'rxjs/operators';


/**
 * Returns an `Observable` that emits when any of the elements are resized.
 *
 * @param elts An element or array of elements.
 * @param options {@link ResizeObserverOptions} - ResizeObserver options
 * @returns An `Observable` that emits whenever the specified elements are resized.
 */
export function resizeObservable(
  elts: Element | Element[],
  options?: ResizeObserverOptions): Observable<ResizeObserverEntry> {

  const eltArray = Array.isArray(elts) ? elts : [elts];

  if (!window.ResizeObserver) {
    return NEVER;
  }

  return new Observable((subscriber) => {
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        // console.log('Resized to: ', entry);
        subscriber.next(entry);
      }
    });

    for (const e of eltArray) {
      observer.observe(e, options);
    }

    return () => {
      observer.disconnect();
    };
  });
}


/**
 * Returns an {@link Observable} that emits the current element border height, in addition
 * to an emitting any time the border height changes.
 * @param elt
 */
export function borderHeightOf(elt: HTMLElement): Observable<number> {
  return resizeObservable(elt, { box: 'border-box' }).pipe(
    skipSizeZero(),
    auditTime(80), // Give size time to stabilize, and prevent "ResizeObserver loop limit exceeded"
    // Currently Safari doesn't support borderBoxSize, so fallback to directly reading the element's height
    map((resizeEntry) => resizeEntry.borderBoxSize?.[0].blockSize ?? (resizeEntry.target as HTMLElement).offsetHeight),
    startWith(elt.offsetHeight),
    distinctUntilChanged()
  );
}

/**
 * A convenience rx.js operator that can be used to skip "size 0" results from {@link resizeObservable}.
 */
export function skipSizeZero(): OperatorFunction<ResizeObserverEntry, ResizeObserverEntry> {
  return function (source: Observable<ResizeObserverEntry>): Observable<ResizeObserverEntry> {
    return source.pipe(
      filter((e) => {
        if (e.borderBoxSize.length === 1) {
          const size = e.borderBoxSize[0];
          return size.inlineSize !== 0 || size.blockSize !== 0;
        }
        return false;
      })
    );
  };
}
