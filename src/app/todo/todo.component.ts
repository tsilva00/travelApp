import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  firestore: AngularFirestoreCollection;
  userstore: AngularFirestoreCollection;
  todos: any[] = [];
  lista: any[] = [];
  item: string = '';
  user: string = '';
  loader!: boolean;
  hideLogin: boolean = true;

  constructor(private db:AngularFirestore) {
    this.firestore = db.collection('items');
    this.userstore = db.collection('users');
   }

  ngOnInit(): void {
    this.db.collection('users').ref.get().then(user => {
      this.todos = user.docs.map(d => d.data())
    })
      
  }

  createUser() {
    if(!this.user) {
      alert('Preencha o usuário!');
      return;
    }
    this.loader = true;
    this.db.collection('users').ref.where('username', "==", ((this.user)).toUpperCase()).get().then(res => {
      if(res.empty) {
          let uId = new Date();
          let userDoc = {
            id: uId.getTime().toString(),
            username:  (this.user).toUpperCase(),
            createdAt: uId 
          }
      
          this.userstore.doc(uId.getTime().toString()).set(userDoc).then(() => {
            this.todos.push(userDoc);
          }).catch((err) => {
            alert('Erro ao salvar: ' + JSON.stringify(err));
          })
        }
    })
    
     this.db.collection('items').ref.where('userId', '==', this.user.toUpperCase()).get().then(items => {
      this.lista = items.docs.map(d => d.data())
      this.loader = false;
   })
  this.hideLogin = false;
}

  onAdd() {
    if(!this.item) {
      alert('Preencha um item!');
      return;
    }
    this.firestore.ref.where('title', "==", this.item.toLowerCase()).where('userId', '==', this.user.toUpperCase()).get().then(res => {
      if(res.empty){
        let docId = new Date();
        let docObj = {
          id: docId.getTime().toString(),
          userId: this.user.toUpperCase(),
          createdAt: docId,
          title: this.item.toLowerCase(),
          isDone: false
        } 
        this.firestore.doc(docId.getTime().toString()).set(docObj).then(() => {
          this.todos.push(docObj);
          this.item = '';
        }).catch((err) => {
          alert('Erro ao salvar dados: ' + JSON.stringify(err));
        });
      }

      this.db.collection('items').ref.where('userId', '==', this.user.toUpperCase()).get().then(items => {
        this.lista = items.docs.map(d => d.data())
     })
    })
  }
  

  onDelete(id: string, index: number, ) {
    if(confirm("Tem certeza que quer deletar esse item?" )){
    this.firestore.doc(id).delete().then(() => {
      this.lista.splice(index, 1);
    }).catch((err) => {
      alert('Erro ao deletar item: ' + JSON.stringify(err));
    });
  }
  }

  onStatusChange(id: string, newstatus: boolean, index: number) {
    this.firestore.doc(id).update({isDone: newstatus}).then(() => {
      this.lista[index].isDone = newstatus;
    }).catch((err) => {
      alert('Erro ao salvar dados: ' + JSON.stringify(err));
    });
  }
}
