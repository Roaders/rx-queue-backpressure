
import {QueueManager} from "../lib/queueManager"
import * as Rx from "rx";

console.log(`Simulating image load`);

let waitingToLoad = 0;
let imagesLoading = 0;
let imagesResizing = 0;
let imagesWaiting = 0;
let imagesUploading = 0;

function updateProgress(overwrite: boolean = true){
    const message = `Waiting to Load: ${waitingToLoad}, Loading: ${imagesLoading}, Resizing: ${imagesResizing}, Waiting: ${imagesWaiting}, Uploading: ${imagesUploading}, Complete: ${queueManager.complete}`

    if(overwrite){
        process.stdout.write(message + "\r");
    } else {
        console.log(message);
    }
}

function loadImage(imagePath: string){
    return Rx.Observable.defer(() => {
        waitingToLoad--;
        imagesLoading++;
        updateProgress();
        return Rx.Observable.interval(Math.random()*1000)
            .take(1)
            .map(() => imagePath)
            .do(imagePath => {
                imagesLoading--;
                updateProgress();
            });
    });
}

function resizeImage(imagePath: string){
    return Rx.Observable.defer(() => {
        imagesResizing++;
        updateProgress();
        return Rx.Observable.interval(Math.random()*1000)
            .take(1)
            .map(() => imagePath)
            .do(imagePath => {
                imagesResizing--;
                imagesWaiting++;
                updateProgress();
            });
    });
}

function uploadImage(imagePath: string){
    return Rx.Observable.defer(() => {
        imagesWaiting--;
        imagesUploading++;
        updateProgress();
        return Rx.Observable.interval(Math.random()*5000)
            .take(1)
            .map(() => imagePath)
            .do(imagePath => {
                imagesUploading--;
                updateProgress();
            });
    });
}

const imageSource = Rx.Observable.range(0,20)
    .map(imageNumber => "image_" + imageNumber);

/** Set our queue length to 6 
 *  This includes all images waiting to load, loading, resizing, waiting to upload and Uploading
 *  If we did not want to include the images actually uploading in this count we would have to move the
 *  itemRemovedfromQueue call within the uploadImage defer() function.
*/
const queueManager = new QueueManager(imageSource,6,updateProgress);

queueManager.queue
    .do(() => waitingToLoad++)
    .map(imagePath => loadImage(imagePath))
    .merge(2)
    .map(imagePath => resizeImage(imagePath))
    .merge(2)
    .map(imagePath => uploadImage(imagePath))
    .merge(2)
    .do(() => queueManager.itemRemovedfromQueue())
    .subscribe(
        () => {},
        error => console.log(`Error: ${error}`),
        () => {
            updateProgress(false);
            console.log(`All Images Complete`);
        }
    );