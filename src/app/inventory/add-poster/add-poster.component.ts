import { Component, ViewChild } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { PosterStockComponent } from '../poster-stock/poster-stock.component';

/** Poster Stock sheet with an editable Stock (pcs) column; every save is logged to the stock history. */
@Component({
  selector: 'app-add-poster',
  standalone: true,
  imports: [PosterStockComponent],
  template: `<app-poster-stock [editable]="true"></app-poster-stock>`
})
export class AddPosterComponent {
  @ViewChild(PosterStockComponent) sheet?: PosterStockComponent;

  get hasUnsavedChanges(): boolean {
    return !!this.sheet?.changeCount;
  }
}

export const addPosterUnsavedChangesGuard: CanDeactivateFn<AddPosterComponent> = component =>
  !component.hasUnsavedChanges || confirm('You have unsaved stock changes. Leave without saving?');
