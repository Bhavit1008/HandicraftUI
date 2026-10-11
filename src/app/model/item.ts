export type ItemStatus = 'In Stock' | 'Process' | 'Sold';

export interface Item {
  id?: string;
  category: string;
  itemCode: string;
  itemName: string;
  material?: string;
  location?: string;
  quality?: string;
  finish?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  quantity: number;
  costPrice?: number;
  sellingPrice?: number;
  status: ItemStatus;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  partyName?: string;
  soldQuantity?: number;
  soldDate?: number;
  createdAt?: number;
}

export interface ItemPage {
  content: Item[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
