import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'table[pta-table]',
  template: `<ng-content />`,
  styleUrl: 'table.scss',
  encapsulation: ViewEncapsulation.None
})
export class Table {
}
