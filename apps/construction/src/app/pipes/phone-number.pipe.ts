import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber',
  standalone: true,
})
export class PhoneNumberPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Assuming the phone number is a 10-digit number
    const areaCode = value.substring(0, 3);
    const firstPart = value.substring(3, 6);
    const secondPart = value.substring(6);

    return `(${areaCode})-${firstPart}-${secondPart}`;
  }
}
