import { Component, OnInit, ViewChild } from '@angular/core';

import { AjaxRequestsService } from "../ajax-requests.service";
import { SseService } from "../sse.service";

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource, MatTable} from '@angular/material/table';

export class Ordine{
  id: number;
  nome: string;
  quantita: number;

  constructor(obj: Object){
    this.id = obj['id'];
    this.nome = obj['nome'];
    this.quantita = obj['quantita'];
  }
}

@Component({
  selector: 'app-ordini',
  templateUrl: './ordini.component.html',
  styleUrls: ['./ordini.component.scss']
})

export class OrdiniComponent implements OnInit {
  tableHeader: string[] = ["id", "nome", "ordiniAttivi", "action"];
  ordini: MatTableDataSource<Ordine>;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private ajax: AjaxRequestsService, private sse: SseService) { 
    this.ordini = new MatTableDataSource<Ordine>();
  }

  private setData(data): void{
    this.ordini.data = Object.values(data);
  }

  ngOnInit(): void {
    /*
    this.ajax.request("http://localhost/ristorante-covid/SERVER/orders.php").subscribe(response => {
      this.setData(response);
      this.ordini.sort = this.sort;
    }); 
    */
    this.sse
      .getServerSentEvent("http://localhost/ristorante-covid/SERVER/serveSSE.php")
      .subscribe(data => {
        data = JSON.parse(data);
        var filtered = data.filter(item => item.ordiniAttivi != "0");//filtered => [6, 7, 8, 9]//array => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        this.setData(filtered);
      });
  }

  evadiOrdine(id: string): void{
    this.ajax.request("http://localhost/ristorante-covid/SERVER/evadiOrdine.php?id="+id).subscribe(response => {
      if(response == ""+true) {
        this.ordini.data.forEach(element => {
          if(""+element.id == id) {element.quantita--;}
        });
    }}); 
  }

  getClass(quantita: number): string{
    if(quantita >= 10) return "high";
    else if(quantita >= 5) return "normal";
    else return "low";
  }

}
