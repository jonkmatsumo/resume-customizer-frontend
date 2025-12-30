import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [ngClass]="type" [style.height]="height" [style.width]="width">
      <div class="shimmer"></div>
    </div>
  `,
  styles: [
    `
      .skeleton-loader {
        background-color: #f0f0f0;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }

      .text {
        height: 1rem;
        margin-bottom: 0.5rem;
      }

      .title {
        height: 2rem;
        margin-bottom: 1rem;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .card {
        height: 200px;
        width: 100%;
        border-radius: 8px;
      }

      .shimmer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'card' = 'text';
  @Input() width?: string;
  @Input() height?: string;
}
