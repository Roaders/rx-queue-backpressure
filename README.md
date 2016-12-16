# rx-queue-backpressure
An RX library to manage the number the items in a queue using backpressure

##Problem

Given a stream like this:

```
Rx.Observable.from(listOf1000Images)
  .map(imagePath => loadImage(imagePath))
  .merge(1)
  .map(image => resizeImage(image))
  .merge(1)
  .map(image => uploadImage(image))
  .merge(1)
  .subscribe();
```

if the `uploadImage` call is very slow there is nothing to slow down the accumulation of images in memory. If loading and resizing the images is very fast but the upload is very slow you would get into the situation where 1000 images had loaded and been resized but only 5 images or so had been uploaded meaning that you have nearly 1000 potentially large images residing in memory.

##Solution

This library allows you to set the number of items you want waiting in a queue so that there are always images waiting for upload but not too many:

```
var imageSource = Rx.Observable.from(listOf1000Images);

var queuedImageSource = new ItemQueue(imageSource,10); // Keep 10 items in queue at all times

queuedImageSource.map(imagePath => loadImage(imagePath))
  .merge(1)
  .map(image => resizeImage(image))
  .merge(1)
  .map(image => uploadImage(image))
  .merge(1)
  .do(queuedImageSource.itemComplete())
  .subscribe();
```

In this example the `queuedImageSource` will immediately release 10 images to be loaded and resized. These 10 images will sit in the queue. When the first of these images has been uploaded the `queuedImageSource.itemComplete()` function will fire reducing the number of images in the queue by 1. At this point another images will be released and loaded.
