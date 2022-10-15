import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AuthorService } from 'src/app/services/author.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductColorModel } from 'src/app/models/ProductColorModel';
import { Status } from 'src/app/common/projectEnum';
import { ToastrService } from 'ngx-toastr';
import { Utility } from 'src/app/common/utility';
import html2canvas from 'html2canvas';
import { jsPDF }from 'jspdf';

@Component({
  selector: 'app-author-entry',
  templateUrl: './author-entry.component.html',
  styleUrls: ['./author-entry.component.css']
})
export class AuthorEntryComponent implements OnInit {
  authorEntryForm:FormGroup;
  compId:number=202;
 lststatus:any;
   isShow:boolean=false;
  selectedItemId: number=0;
  searchText: string;
  lstColorModel:ProductColorModel[]=[];
  colorModel:ProductColorModel | undefined;
  @ViewChild('content',{static:false}) content!: ElementRef;
  @ViewChild('tableListPdf',{static:false}) tableListPdf!: ElementRef;
  constructor(
    private fb:FormBuilder,
    private authorservice:AuthorService,
    private utility:Utility,
    private _modalService:NgbModal,
    private _toasterService:ToastrService,
  ) { }

  ngOnInit(): void {
    this.lststatus=this.utility.enumToArray(Status);
    this.getAllColorBytCompId();
    this.createForm();

  }


  saveAuthor(){
    console.log("save",this.formVal);
    let author=new ProductColorModel();
    author=this.formVal;
    if(this.formVal.status == 1){
      author.status=Status.Active;
    }else{
      author.status=Status.Inactive;
    }
    this.authorservice.saveAuthor(this.formVal).subscribe((res:any)=>{
      if(res){
          this.getAllColorBytCompId();
        this._toasterService.success("Save Successfully");
        this._modalService.dismissAll();
      }
    })
   }


     openModalForSave(event:any){
    this._modalService.open(event,{size: 'lg', windowClass: 'modal-xl'});
  }


   tableListPdfView(){
      let PDF = new jsPDF('p', 'mm', 'a4',);
      html2canvas(this.tableListPdf.nativeElement, { scale: 3 }).then((canvas) => {
      const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
      const fileWidth = 200;
      const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;
      PDF.addImage(imageGeneratedFromTemplate, 'PNG', 0, 5, fileWidth, generatedImageHeight,);
       PDF.html(this.tableListPdf.nativeElement.innerHTML);
      let blob = PDF.output("blob");
        window.open(URL.createObjectURL(blob));
      
    });
    this.isShow=false;
  }


  getAllColorBytCompId(){
    this.authorservice.getAllColorByComp(202).subscribe(res=>{
      this.lstColorModel=res as ProductColorModel[];
      console.log("getColor",this.lstColorModel)

    });
  }

  editColorById(id:number,event:any){
  this._modalService.open(event,{size: 'lg', windowClass: 'modal-xl'});
  this.authorservice.getColorById(id).subscribe(res=>{
    this.colorModel=res as ProductColorModel;
    this.authorEntryForm.patchValue(this.colorModel);
  })

}


 delete(index: number, modal: any) {
    this.selectedItemId = index;
    this._modalService.open(modal);
  }
  removeDetailFormRow(colorId:number) {
    this.authorservice.deleteColor(colorId).subscribe(res=>{
      this._toasterService.success("Delete Successfully");
        this.getAllColorBytCompId();

    })
  }

 changeById(id:number){
    this.colorModel=this.lstColorModel.find(p=>p.id==id);
    this.isShow=true;
  }


    makePdf(){
      let PDF = new jsPDF('p', 'mm', 'a4',);
      html2canvas(this.content.nativeElement, { scale: 3 }).then((canvas) => {
      const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
      const fileWidth = 200;
      const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;
      PDF.addImage(imageGeneratedFromTemplate, 'PNG', 0, 5, fileWidth, generatedImageHeight,);
       PDF.html(this.content.nativeElement.innerHTML);
      let blob = PDF.output("blob");
        window.open(URL.createObjectURL(blob));
      
    });
  }
  
    viewPrint(id:number){
    this.colorModel=this.lstColorModel.find(p=>p.id==id);
    this.makePdf();
  
  }

   reset(){
    this.createForm();
   }
  createForm(){
    this.authorEntryForm=this.fb.group({
      id:[0,[]],
      compId:[this.compId,[]],
      colorName:['',[]],
      description:['',[]],
      sortOrder:[0,[]],
      isActive:[0,[]],
      moduleId:[20,[]],
      status:[1,[]],
    })
  }

   get formVal(){
    return this.authorEntryForm.value;
  }
  get f(){
    return this.authorEntryForm.controls;
  }

}
