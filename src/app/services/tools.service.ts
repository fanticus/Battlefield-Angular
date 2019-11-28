import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ToolsService {
  getRandom(min: number, max: number): number {
    return Math.round(Math.random() * (max - min)) + min;
  }
}
