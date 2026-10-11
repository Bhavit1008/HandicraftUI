import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoginPage = true;
  isInventoryRoute = false;
  inventoryOpen = true;
  /** Slide-out menu state on mobile/tablet; the sidebar is always visible on desktop. */
  menuOpen = false;

  constructor(private router: Router, public auth: AuthService) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      this.isLoginPage = url.startsWith('/login');
      this.isInventoryRoute = url.startsWith('/items') || url.startsWith('/inventory');
      if (this.isInventoryRoute) this.inventoryOpen = true;
      this.setMenu(false);
    });
  }

  setMenu(open: boolean): void {
    this.menuOpen = open;
    // Stop the page behind the open menu from scrolling.
    document.body.classList.toggle('nav-open', open);
  }

  /** Close the menu when a link is tapped, including the link for the page already shown. */
  onNavClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('a')) this.setMenu(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) this.setMenu(false);
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get currentUser(): string {
    return this.auth.getCurrentUser() ?? '';
  }

  get initials(): string {
    return this.currentUser
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  get roleLabel(): string {
    const role = this.auth.getCurrentRole();
    if (role === 'admin') return 'Admin';
    if (role === 'store_manager') return 'Store Manager';
    return '';
  }

  logout(): void {
    this.setMenu(false);
    this.auth.clearSession();
    this.router.navigate(['/login']);
  }
}
