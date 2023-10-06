import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private sanitizer: DomSanitizer) {}
  bufferToSafeUrl(
    buffer: { type: string; data: number[] } | null | undefined
  ): SafeUrl {
    if (!buffer || !buffer.data || buffer.data.length === 0) {
      return '';
    } else {
      const uintArray = new Uint8Array(buffer.data);
      const blob = new Blob([uintArray], { type: buffer.type });
      const imageObjectUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(blob)
      );
      return imageObjectUrl;
    }
  }
}
