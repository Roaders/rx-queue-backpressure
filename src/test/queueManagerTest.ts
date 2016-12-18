
import {QueueManager} from "../lib/queueManager"
import * as Rx from "rx";

describe("Queue Manager", () => {

    var queueManager: QueueManager<number>;

    var receivedItems: number[];

    beforeEach(() => {
        receivedItems = [];
    });

    describe("when queue length of 4 is defined at construction", () => {

        describe("and a cold observable used as source", () => {

            beforeEach(() => {
                const itemSource = Rx.Observable.range(1,10);
                queueManager = new QueueManager<number>(itemSource,4);
            });

            it("should release 4 items upon subscription", () => {
                subscribe();

                expect(receivedItems).toEqual([1,2,3,4]);

                assertCounts(10,6,4,0);
            });

            it("when item is complete another item should be added to the queue",() => {
                subscribe();

                assertCountsAsItemsComplete();
            });
        });
    });

    describe("and a hot observable used as source", () => {

        let itemSource: Rx.Subject<number[]>;

        beforeEach(() => {
            itemSource = new Rx.Subject<number[]>();
            const flattenedSource = itemSource.flatMap(numbers => Rx.Observable.from(numbers))
            queueManager = new QueueManager<number>(flattenedSource,4);
        });

        it("should not release any items upon subscription", () => {
            subscribe();

            expect(receivedItems).toEqual([]);

            assertCounts(0,0,0,0);
        });

        it("when source passes items 4 items added to queue", () => {
            subscribe();

            itemSource.onNext([1,2,3,4,5,6,7,8,9,10]);

            assertCountsAsItemsComplete();
        });

        it("after all items complete when more items passed by source 4 more items added to source",() => {
            subscribe();

            itemSource.onNext([1,2,3,4,5,6,7,8,9,10]);

            assertCountsAsItemsComplete();

            itemSource.onNext([11,12,13,14,15,16,17,18,19,20]);

            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
            assertCounts(20,6,4,10);
        });
    });

    describe("with observable passed to control stream length", () => {

        let queueLengthSubject: Rx.Subject<number>;
        let queueLengthSource: Rx.Observable<number>;

        beforeEach(() => {
            const itemSource = Rx.Observable.range(1,10);
            queueLengthSubject = new Rx.Subject<number>();
            queueLengthSource = queueLengthSubject
                .merge(Rx.Observable.just(1));

            queueManager = new QueueManager<number>(itemSource,queueLengthSource);
        });

        it("should release one item upon subscription", () => {
            subscribe();

            expect(receivedItems).toEqual([1]);
            assertCounts(10,9,1,0);
            
            queueLengthSubject.onNext(2);
            expect(receivedItems).toEqual([1,2]);
            assertCounts(10,8,2,0);
            
            queueLengthSubject.onNext(3);
            expect(receivedItems).toEqual([1,2,3]);
            assertCounts(10,7,3,0);

            queueLengthSubject.onNext(1);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3]);
            assertCounts(10,7,2,1);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3]);
            assertCounts(10,7,1,2);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4]);
            assertCounts(10,6,1,3);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5]);
            assertCounts(10,5,1,4);

            queueLengthSubject.onNext(4);

            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8]);
            assertCounts(10,2,4,4);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9]);
            assertCounts(10,1,4,5);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
            assertCounts(10,0,4,6);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
            assertCounts(10,0,3,7);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
            assertCounts(10,0,2,8);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
            assertCounts(10,0,1,9);

            queueManager.itemRemovedfromQueue();
            expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
            assertCounts(10,0,0,10);
        });
    });

    function assertCountsAsItemsComplete(){

        expect(receivedItems).toEqual([1,2,3,4]);
        assertCounts(10,6,4,0);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5]);
        assertCounts(10,5,4,1);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6]);
        assertCounts(10,4,4,2);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7]);
        assertCounts(10,3,4,3);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8]);
        assertCounts(10,2,4,4);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9]);
        assertCounts(10,1,4,5);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
        assertCounts(10,0,4,6);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
        assertCounts(10,0,3,7);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
        assertCounts(10,0,2,8);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
        assertCounts(10,0,1,9);

        queueManager.itemRemovedfromQueue();
        expect(receivedItems).toEqual([1,2,3,4,5,6,7,8,9,10]);
        assertCounts(10,0,0,10);
    }

    function assertCounts(total: number, notStarted: number, inProgress: number, complete: number){
        expect(queueManager.total).toEqual(total);
        expect(queueManager.notStarted).toEqual(notStarted);
        expect(queueManager.inProgress).toEqual(inProgress);
        expect(queueManager.complete).toEqual(complete);
    };

    function subscribe(){
        queueManager.queue.subscribe(item => receivedItems.push(item));
    };

});