import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { GeneralSideBarComponent } from './generalSideBar/general-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [GeneralComponent, GeneralSideBarComponent, DashboardComponent],
  imports: [CommonModule, GeneralRoutingModule],
})
export class GeneralModule {}
