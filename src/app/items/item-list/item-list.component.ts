import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '../../model/item';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: items => {
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load items.';
        this.loading = false;
      }
    });
  }

  remove(item: Item): void {
    if (!item.id || !confirm(`Delete "${item.itemName}"?`)) return;

    this.itemService.delete(item.id).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to delete item.')
    });
  }
}
