import { Component } from '@angular/core';
import { MirrorHeightDirective, MirrorWidthDirective } from '@myorg/ui-components/mirror-size';

@Component({
  selector: 'ui-sticky',
  standalone: true,
  templateUrl: './Sticky.component.html',
  imports: [
    MirrorHeightDirective,
    MirrorWidthDirective
  ]
})
export class StickyComponent {

}
