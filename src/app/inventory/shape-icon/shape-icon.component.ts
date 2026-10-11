import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { PosterShape } from '../../model/poster-stock';

let nextId = 0;

/** Marble-style illustration of a poster shape, drawn as SVG so no image assets are needed. */
@Component({
  selector: 'app-shape-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient [attr.id]="gradientId" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="65%" stop-color="#eeece8" />
          <stop offset="100%" stop-color="#d6d2cc" />
        </radialGradient>
      </defs>
      <path *ngFor="let offset of layerOffsets" [attr.d]="outline" [attr.transform]="'translate(0,' + offset + ')'"
            fill="#c9c3bb" stroke="#ffffff" stroke-width="1" />
      <path [attr.d]="outline" [attr.fill]="'url(#' + gradientId + ')'" stroke="#d9d4ce" stroke-width="1" />
      <path [attr.d]="veins" fill="none" stroke="#c7a98e" stroke-width="0.9" stroke-linecap="round" opacity="0.75" />
    </svg>
  `
})
export class ShapeIconComponent implements OnChanges {
  @Input({ required: true }) shape!: PosterShape;
  @Input() size = 64;

  readonly gradientId = `marble-${nextId++}`;
  outline = '';
  veins = '';
  layerOffsets: number[] = [];

  ngOnChanges(): void {
    const isSquare = this.shape === 'Square';
    const cx = 50;
    const cy = isSquare ? 34 : 44;
    const r = 36;
    const ry = isSquare ? 0.5 : 0.85;

    this.layerOffsets = isSquare ? [27, 18, 9] : [7];
    this.outline = this.buildOutline(cx, cy, r, ry);

    const p = (x: number, y: number) => `${(cx + x * r).toFixed(1)} ${(cy + y * r * ry).toFixed(1)}`;
    this.veins = `M ${p(-0.55, -0.25)} Q ${p(-0.1, -0.05)} ${p(0.1, 0.15)} T ${p(0.5, 0.4)} `
      + `M ${p(-0.2, -0.55)} Q ${p(0, -0.2)} ${p(0.35, -0.15)} `
      + `M ${p(-0.4, 0.35)} Q ${p(-0.15, 0.2)} ${p(0.05, 0.5)}`;
  }

  private buildOutline(cx: number, cy: number, r: number, ry: number): string {
    if (this.shape === 'Round') {
      const ryr = r * ry;
      return `M ${cx - r} ${cy} A ${r} ${ryr} 0 1 0 ${cx + r} ${cy} A ${r} ${ryr} 0 1 0 ${cx - r} ${cy} Z`;
    }

    const sides = { Square: 4, Hexagon: 6, Octagon: 8 }[this.shape];
    const rotation = { Square: -90, Hexagon: 0, Octagon: 22.5 }[this.shape];
    const points = Array.from({ length: sides }, (_, i) => {
      const angle = ((rotation + (360 / sides) * i) * Math.PI) / 180;
      return `${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * ry * Math.sin(angle)).toFixed(1)}`;
    });
    return `M ${points.join(' L ')} Z`;
  }
}
