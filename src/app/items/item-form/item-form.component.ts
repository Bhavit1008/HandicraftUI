import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../../model/item';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent implements OnInit {
  item: Item = {
    category: '',
    itemCode: '',
    itemName: '',
    quantity: 1,
    status: 'In Stock'
  };

  isEdit = false;
  saving = false;
  errorMessage: string | null = null;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.itemService.getById(id).subscribe(item => (this.item = item));
    }
  }

  save(): void {
    if (!this.item.itemCode.trim() || !this.item.itemName.trim() || !this.item.category.trim()) {
      this.errorMessage = 'Item Code, Name and Category are required.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;

    this.itemService.save(this.item).subscribe({
      next: () => this.router.navigate(['/items']),
      error: err => {
        this.saving = false;
        this.errorMessage = err?.error ?? 'Failed to save item.';
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.itemService.uploadImage(file).subscribe({
      next: url => (this.item.imageUrl = url),
      error: () => alert('Image upload failed.')
    });
  }
}
