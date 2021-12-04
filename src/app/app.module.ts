import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';

import { Solutions2021Module } from './solutions2021/solutions2021.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    MatToolbarModule,
    Solutions2021Module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
