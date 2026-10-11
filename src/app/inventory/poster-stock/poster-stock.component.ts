import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  POSTER_FINISHES,
  POSTER_QUALITIES,
  POSTER_SHAPES,
  PosterFinish,
  PosterQuality,
  PosterShape,
  PosterStock
} from '../../model/poster-stock';
import { PosterStockService } from '../../services/poster-stock.service';
import { PosterStockHistoryComponent } from '../poster-stock-history/poster-stock-history.component';
import { ShapeIconComponent } from '../shape-icon/shape-icon.component';

interface Breakdown<K> {
  key: K;
  value: number;
}

interface ShapeCard {
  shape: PosterShape;
  total: number;
  byQuality: Breakdown<PosterQuality>[];
}

interface ListGroup {
  shape: PosterShape;
  rows: { sn: number; row: PosterStock }[];
}

interface DonutSlice {
  label: string;
  value: number;
  pct: number;
  color: string;
  dash: string;
  offset: number;
}

@Component({
  selector: 'app-poster-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, ShapeIconComponent, PosterStockHistoryComponent],
  templateUrl: './poster-stock.component.html',
  styleUrl: './poster-stock.component.css'
})
export class PosterStockComponent implements OnInit {
  /** When true the Stock (pcs) column becomes editable and the header offers Save instead of Export. */
  @Input() editable = false;

  readonly shapes = POSTER_SHAPES;
  readonly finishes = POSTER_FINISHES;
  readonly qualities = POSTER_QUALITIES;

  readonly shapeColors: Record<PosterShape, string> = {
    Round: '#ff5a1f',
    Square: '#1c1c1f',
    Hexagon: '#f3c9a8',
    Octagon: '#8e8e93'
  };
  readonly finishColors: Record<PosterFinish, string> = {
    Raw: '#f3c9a8',
    Polished: '#ff5a1f',
    Butti: '#1c1c1f'
  };
  readonly qualityColors: Record<PosterQuality, string> = {
    'Super White': '#e4e4ea',
    Average: '#f0c39e',
    Purple: '#a879e0',
    Commercial: '#6b6b70'
  };

  allRows: PosterStock[] = [];
  loading = true;
  errorMessage: string | null = null;

  // Page filters apply to the cards, the list and the charts.
  shapeFilter: PosterShape | '' = '';
  finishFilter: PosterFinish | '' = '';
  qualityFilter: PosterQuality | '' = '';

  // List filters narrow the table only.
  listShapeFilter: PosterShape | '' = '';
  listFinishFilter: PosterFinish | '' = '';
  listQualityFilter: PosterQuality | '' = '';

  pageRows: PosterStock[] = [];
  pageTotal = 0;
  shapeCards: ShapeCard[] = [];
  totalByQuality: Breakdown<PosterQuality>[] = [];
  listGroups: ListGroup[] = [];
  listTotal = 0;
  shapeSlices: DonutSlice[] = [];
  finishSlices: DonutSlice[] = [];
  qualitySlices: DonutSlice[] = [];

  selected: PosterStock | null = null;

  // Edit mode: unsaved stock values keyed by row id (null while the input is empty).
  drafts: Record<string, number | null> = {};
  saving = false;
  saveMessage: string | null = null;
  saveError: string | null = null;
  historyRefresh = 0;

  constructor(private posterStockService: PosterStockService) {}

  ngOnInit(): void {
    this.posterStockService.getAll().subscribe({
      next: rows => {
        this.allRows = rows;
        this.loading = false;
        this.refresh();
      },
      error: () => {
        this.errorMessage = 'Failed to load poster stock. Check that the backend is running.';
        this.loading = false;
      }
    });
  }

  get changeCount(): number {
    return Object.keys(this.drafts).length;
  }

  get hasInvalidDrafts(): boolean {
    return Object.values(this.drafts).some(value => !this.isValidStock(value));
  }

  /** Value shown in a stock input: the unsaved draft if there is one, otherwise the saved stock. */
  stockInputValue(row: PosterStock): number | null {
    return row.id && row.id in this.drafts ? this.drafts[row.id] : this.savedStock(row.id);
  }

  isChanged(row: PosterStock): boolean {
    return !!row.id && row.id in this.drafts;
  }

  isInvalid(row: PosterStock): boolean {
    return this.isChanged(row) && !this.isValidStock(this.drafts[row.id!]);
  }

  /** Difference between the draft and the saved stock, for the +/- badge. */
  draftDelta(row: PosterStock): number {
    const draft = this.drafts[row.id!];
    return this.isValidStock(draft) ? draft! - this.savedStock(row.id) : 0;
  }

  onStockInput(row: PosterStock, value: number | null): void {
    if (!row.id) return;
    this.saveMessage = null;
    this.saveError = null;

    if (value === this.savedStock(row.id)) {
      delete this.drafts[row.id];
    } else {
      this.drafts[row.id] = value;
    }
    this.refresh();
  }

  discardChanges(): void {
    this.drafts = {};
    this.saveMessage = null;
    this.saveError = null;
    this.refresh();
  }

  saveChanges(): void {
    if (!this.changeCount || this.hasInvalidDrafts || this.saving) return;

    const updates = Object.entries(this.drafts).map(([id, stock]) => ({ id, stock: stock! }));
    this.saving = true;
    this.saveError = null;
    this.saveMessage = null;

    this.posterStockService.updateStock(updates).subscribe({
      next: rows => {
        this.allRows = rows;
        this.drafts = {};
        this.saving = false;
        this.saveMessage = `Saved ${updates.length} stock change${updates.length === 1 ? '' : 's'}.`;
        this.historyRefresh++;
        this.refresh();
      },
      error: err => {
        this.saving = false;
        this.saveError = typeof err?.error === 'string' && err.error ? err.error : 'Failed to save stock changes.';
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  warnOnUnsavedChanges(event: BeforeUnloadEvent): void {
    if (this.editable && this.changeCount) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  trackGroup(_: number, group: ListGroup): string {
    return group.shape;
  }

  trackEntry(_: number, entry: { row: PosterStock }): string | undefined {
    return entry.row.id;
  }

  refresh(): void {
    this.pageRows = this.filterRows(this.effectiveRows(), this.shapeFilter, this.finishFilter, this.qualityFilter);
    this.pageTotal = this.sum(this.pageRows);

    this.shapeCards = this.shapes.map(shape => {
      const rows = this.pageRows.filter(r => r.shape === shape);
      return { shape, total: this.sum(rows), byQuality: this.breakdown(rows, this.qualities, r => r.quality) };
    });
    this.totalByQuality = this.breakdown(this.pageRows, this.qualities, r => r.quality);

    this.refreshList();

    this.shapeSlices = this.slices(this.breakdown(this.pageRows, this.shapes, r => r.shape), this.shapeColors);
    this.finishSlices = this.slices(
      this.breakdown(this.pageRows, this.finishes, r => r.finish ?? undefined),
      this.finishColors
    );
    this.qualitySlices = this.slices(this.totalByQuality, this.qualityColors);
  }

  refreshList(): void {
    const rows = this.filterRows(this.pageRows, this.listShapeFilter, this.listFinishFilter, this.listQualityFilter);
    this.listTotal = this.sum(rows);

    let sn = 0;
    this.listGroups = this.shapes
      .map(shape => ({
        shape,
        rows: rows.filter(r => r.shape === shape).map(row => ({ sn: ++sn, row }))
      }))
      .filter(group => group.rows.length > 0);
  }

  resetListFilters(): void {
    this.listShapeFilter = '';
    this.listFinishFilter = '';
    this.listQualityFilter = '';
    this.refreshList();
  }

  exportCsv(): void {
    const header = ['S.No.', 'Shape', 'Finish', 'Quality', 'Stock (pcs)', 'Remarks'];
    const lines = this.pageRows.map((r, i) =>
      [i + 1, r.shape, r.finish ?? '-', r.quality, r.stock, r.remarks || '-']
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );
    lines.push(['', '"Total Stock"', '', '', this.pageTotal, ''].join(','));

    const blob = new Blob([[header.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'poster-stock.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Saved rows with valid unsaved edits applied, so cards and charts preview the result before saving. */
  private effectiveRows(): PosterStock[] {
    return this.allRows.map(row => {
      const draft = row.id ? this.drafts[row.id] : undefined;
      return this.isValidStock(draft) ? { ...row, stock: draft! } : row;
    });
  }

  private savedStock(id?: string): number {
    return this.allRows.find(r => r.id === id)?.stock ?? 0;
  }

  private isValidStock(value: number | null | undefined): boolean {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
  }

  private filterRows(
    rows: PosterStock[],
    shape: PosterShape | '',
    finish: PosterFinish | '',
    quality: PosterQuality | ''
  ): PosterStock[] {
    return rows.filter(r =>
      (!shape || r.shape === shape) &&
      (!finish || r.finish === finish) &&
      (!quality || r.quality === quality)
    );
  }

  private sum(rows: PosterStock[]): number {
    return rows.reduce((total, r) => total + (r.stock || 0), 0);
  }

  private breakdown<K>(rows: PosterStock[], keys: K[], keyOf: (r: PosterStock) => K | undefined): Breakdown<K>[] {
    return keys.map(key => ({ key, value: this.sum(rows.filter(r => keyOf(r) === key)) }));
  }

  /** Builds donut segments on a circle with circumference 100, starting at 12 o'clock. */
  private slices<K extends string>(parts: Breakdown<K>[], colors: Record<K, string>): DonutSlice[] {
    const total = parts.reduce((t, p) => t + p.value, 0);
    let start = 0;
    return parts.map(part => {
      const length = total ? (part.value / total) * 100 : 0;
      const slice: DonutSlice = {
        label: part.key,
        value: part.value,
        pct: Math.round(length),
        color: colors[part.key],
        dash: `${length} ${100 - length}`,
        offset: 25 - start
      };
      start += length;
      return slice;
    });
  }
}
