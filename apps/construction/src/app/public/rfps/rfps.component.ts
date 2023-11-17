import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rfps',
  templateUrl: './rfps.component.html',
  styleUrls: ['./rfps.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RfpsComponent {
  constructor() {}
}
