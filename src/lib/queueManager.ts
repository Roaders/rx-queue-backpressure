
import * as Rx from "rxjs";

export class QueueManager<T> extends Rx.Observable<T>{
    
    constructor(source: Rx.Observable<T>){
        super();
    }
}

function manageQueue<T>(queueLength: number) {
   // We *could* do a `var self = this;` here to close over, but see next comment
   return Rx.Observable.create(subscriber => {
     // because we're in an arrow function `this` is from the outer scope.
     var source: Rx.Observable<T> = this;

     // save our inner subscription
     var subscription = source.controlled();

     // to return now
     return subscription;
   });
}