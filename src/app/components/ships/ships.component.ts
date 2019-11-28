import { Component, Input } from '@angular/core';
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { ShipInterface } from 'src/app/interfaces/ship.interface';
import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

import { ShipsService } from 'src/app/services/ships.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})

export class ShipsComponent {
  //  ---  Добавить в редакс shipsService.currentShip и shipsService.allShips, используются в верстке

  @Input() shipsData: ShipsDataInterface;

  constructor(
    private shipsService: ShipsService
  ) { }

  selectShip(ship: ShipInterface): void {
    //  ---  Доработать под редакс
    this.shipsService.currentShip = ship;
  }

  // Закоменчена по причине не надобности на данном этапе
  /*drop(event: CdkDragDrop<string[]>) {
    console.log('eventDragDrop', event);
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //                     event.container.data,
    //                     event.previousIndex,
    //                     event.currentIndex);
    // }
  }*/

  // Эта штука дополнительно обновляла расстанавливающие корабли при переходе на экран Game
  // Обновление и так происходит вызовом функции в компоненте Playground
  /*ngOnChanges() {
    this.shipsService.playerShipsInit();
  }*/
}
