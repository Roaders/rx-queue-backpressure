
import {QueueManager} from "../lib/queueManager"
import * as Rx from "rx";

describe("Queue Manager", () => {
  
    var itemSource: Rx.Observable<number>;
    var queueManager: QueueManager<number>;

    var receivedItems: number[];

    beforeEach(() => {
        receivedItems = [];
    });

    describe("when queue length of 5 is defined at construction", () => {

        beforeEach(() => {
            itemSource = Rx.Observable.range(0,50);
            queueManager = new QueueManager<number>(itemSource)
        });

        it("should release 5 items upon construction", () => {
            queueManager.subscribe();

            expect(receivedItems).toEqual([1,2,3,4,5]);
        });

    })

    describe("with observable passed to control stream length", () => {
        
    })

})