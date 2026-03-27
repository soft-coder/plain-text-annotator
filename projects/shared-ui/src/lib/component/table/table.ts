import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'table[pta-table]',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: 'table.scss',
  encapsulation: ViewEncapsulation.None
})
export class Table {}
