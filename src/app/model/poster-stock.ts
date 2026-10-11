export type PosterShape = 'Round' | 'Square' | 'Hexagon' | 'Octagon';
export type PosterFinish = 'Raw' | 'Polished' | 'Butti';
export type PosterQuality = 'Super White' | 'Average' | 'Purple' | 'Commercial';

export interface PosterStock {
  id?: string;
  shape: PosterShape;
  finish?: PosterFinish | null;
  quality: PosterQuality;
  stock: number;
  remarks?: string;
  sortOrder?: number;
  updatedBy?: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface PosterStockUpdate {
  id: string;
  stock: number;
}

/** One logged stock change. */
export interface PosterStockHistory {
  id?: string;
  posterStockId: string;
  shape: PosterShape;
  finish?: PosterFinish | null;
  quality: PosterQuality;
  previousStock: number;
  newStock: number;
  change: number;
  updatedBy: string;
  updatedByRole?: string | null;
  updatedAt: number;
  /** yyyy-MM-dd of the change, in the server's business timezone. */
  date: string;
}

export const POSTER_SHAPES: PosterShape[] = ['Round', 'Square', 'Hexagon', 'Octagon'];
export const POSTER_FINISHES: PosterFinish[] = ['Raw', 'Polished', 'Butti'];
export const POSTER_QUALITIES: PosterQuality[] = ['Super White', 'Average', 'Purple', 'Commercial'];
