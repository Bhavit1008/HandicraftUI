import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosterStockHistory } from '../../model/poster-stock';
import { PosterStockService } from '../../services/poster-stock.service';

interface HistoryDay {
  date: string;
  entries: PosterStockHistory[];
  net: number;
  updaters: string[];
}

/** Day-wise log of poster stock changes: who changed what, and when. */
@Component({
  selector: 'app-poster-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poster-stock-history.component.html',
  styleUrl: './poster-stock-history.component.css'
})
export class PosterStockHistoryComponent implements OnChanges {
  /** Bump this to reload, e.g. after a save. */
  @Input() refreshToken = 0;

  from = this.isoDay(-6);
  to = this.isoDay(0);
  days: HistoryDay[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(private posterStockService: PosterStockService) {}

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.from || !this.to || this.from > this.to) {
      this.errorMessage = 'Choose a "From" date on or before the "To" date.';
      this.days = [];
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.posterStockService.getHistory(this.from, this.to).subscribe({
      next: entries => {
        this.days = this.groupByDay(entries);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load stock history.';
        this.loading = false;
      }
    });
  }

  /** Entries arrive newest first, so days come out newest first too. */
  private groupByDay(entries: PosterStockHistory[]): HistoryDay[] {
    const byDate = new Map<string, HistoryDay>();
    for (const entry of entries) {
      let day = byDate.get(entry.date);
      if (!day) {
        day = { date: entry.date, entries: [], net: 0, updaters: [] };
        byDate.set(entry.date, day);
      }
      day.entries.push(entry);
      day.net += entry.change;
      if (!day.updaters.includes(entry.updatedBy)) day.updaters.push(entry.updatedBy);
    }
    return [...byDate.values()];
  }

  /** Local yyyy-MM-dd, offset by a number of days from today. */
  private isoDay(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
