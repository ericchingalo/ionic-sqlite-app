import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  dataList: any;

  constructor() {
    this.dataList = [];

    for (let i = 0; i < 15; i++) {
      this.dataList.push('Item number ' + this.dataList.length);
    }
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      for (let i = 0; i < 10; i++) {
        this.dataList.push('Item number ' + this.dataList.length);
      }
      event.target.complete();

      if (this.dataList.length >= 100) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
