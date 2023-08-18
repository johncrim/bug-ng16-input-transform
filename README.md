# Angular 16 Standalone Lib Repro

This is a repro case for:
https://github.com/angular/angular

Created with:

```ps1
yarn dlx --package @angular/cli ng new ng16-standalone-lib --standalone --package-manager=yarn --create-application=false --minimal --commit=false

# Check for upgrade latest
yarn ng update @angular/core @angular/cli @angular/common
yarn upgrade-interactive

# Add libraries
yarn ng g library ui-components -p ui --project-root libs/ui-components --standalone
yarn ng g library util -p util --project-root libs/util --standalone

```

## Bugbug

Issue Title: Directive not recognized as directive when using @Input transform

The bug can be reproduced by:

```sh
yarn
yarn build:all
```

The compile error is:
```
------------------------------------------------------------------------------
Building entry point 'ui-components/sticky'
------------------------------------------------------------------------------
✖ Compiling with Angular sources in Ivy partial compilation mode.
libs/ui-components/sticky/src/Sticky.component.ts:10:5 - error NG2012: Component imports must be standalone components, directives, pipes, or must be NgModules.

10     MirrorWidthDirective
       ~~~~~~~~~~~~~~~~~~~~

error Command failed with exit code 1.
```

This error is caused by the use of `@Input({transform: ...})` in `MirrorWidthDirective`. The problem is that the use of the input transform feature breaks the build output: The contents of `dist\ui-components\fesm2022\ui-components-mirror-size.mjs` show that `class MirrorWidthDirective` is missing the static `ɵdir` and `ɵfac` properties:

```js
let MirrorWidthDirective = class MirrorWidthDirective {
  // ... (class properties and methods)
};
__decorate([
    Input({ alias: 'ui-mirror-width', required: true, transform: coerceElement })
], MirrorWidthDirective.prototype, "source", void 0);
MirrorWidthDirective = __decorate([
    Directive({
        selector: '[ui-mirror-width]',
        standalone: true,
        exportAs: 'ui-mirror-width'
    })
], MirrorWidthDirective);
```

The similar directive `MirrorHeightDirective` is equivalent but omits use of the `@Input transform`. It is in the same project, but the compiler output (in `dist\ui-components\fesm2022\ui-components-mirror-size.mjs`) is:

```js
class MirrorHeightDirective {
  // ... (class properties and methods)
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: MirrorHeightDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.2.1", type: MirrorHeightDirective, isStandalone: true, selector: "[ui-mirror-height]", inputs: { source: ["ui-mirror-height", "source"] }, exportAs: ["ui-mirror-height"], usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: MirrorHeightDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ui-mirror-height]',
                    standalone: true,
                    exportAs: 'ui-mirror-height'
                }]
        }], propDecorators: { source: [{
                type: Input,
                args: [{ alias: 'ui-mirror-height', required: true }]
            }] } });
```

The second directive can be imported, but the first one can't, b/c the second is recognized as a directive b/c `static ɵdir` exists.
