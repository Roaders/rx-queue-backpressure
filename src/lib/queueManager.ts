
import * as Rx from "rx";
import {IStreamInfo, StreamCounter} from "stream-item-timer"

export interface IQueueInfo extends IStreamInfo{
    notStarted: number;
}

export class QueueManager<T> implements IQueueInfo {

    //  Constructor

    constructor(source: Rx.Observable<T>, queueLengthProvider: number | Rx.Observable<number>){
        this._notStartedCounter = new StreamCounter();
        this._inProgressCounter = new StreamCounter();

        this._controlled = source
            .do(() => this._notStartedCounter.newItem())
            .controlled();

        this._downStream = this._controlled
            .do(() => {
                this._notStartedCounter.itemComplete();
                this._inProgressCounter.newItem();
            })
            .doOnCompleted(() => this.handleStreamComplete());

        if(typeof queueLengthProvider === "number"){
            this._queueLength = queueLengthProvider;
        } else {
            this._queueLengthDisposable = queueLengthProvider.subscribe(
                length => this.handleQueueLengthUpdate(length)
            );
        }

        this.request();
    }

    //  Private Variables

    private _queueLengthDisposable: Rx.Disposable;

    private _queueLength: number = 0;

    private _notStartedCounter: StreamCounter;
    private _inProgressCounter: StreamCounter;
    private _controlled: Rx.ControlledObservable<T>;
    private _downStream: Rx.Observable<T>;

    //  Properties

    get queue(): Rx.Observable<T>{
        return this._downStream;
    }

    get notStarted(): number{
        return this._notStartedCounter.inProgress;
    }

    get inProgress(): number{
        return this._inProgressCounter.inProgress;
    }

    get total(): number{
        return this._notStartedCounter.total;
    }

    get complete(): number{
        return this._inProgressCounter.complete;
    }

    //  Public Functions

    itemRemovedfromQueue(){
        this._inProgressCounter.itemComplete();
        this.request();
    }

    //  Private Functions

    private request(){
         this._controlled.request(this._queueLength - this._inProgressCounter.inProgress);
    }

    private handleQueueLengthUpdate(length: number){
        this._queueLength = length;

        this.request();
    }

    private handleStreamComplete(){
        if(this._queueLengthDisposable){
            this._queueLengthDisposable.dispose();
        }
    }
}