/*!
 * swiped-events.js - v@version@
 * Pure JavaScript swipe events
 * https://github.com/john-doherty/swiped-events
 * @inspiration https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
(function(window, document) {

  'use strict';

  // patch CustomEvent to allow constructor creation (IE/Chrome)
  if (typeof window.CustomEvent !== 'function') {

    window.CustomEvent = function(event, params) {

      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };

      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
  }

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  var xDown = null;
  var yDown = null;
  var xDiff = null;
  var yDiff = null;
  var timeDown = null;
  var startEl = null;

  function handleTouchEnd(e) {

    // if the user released on a different target, cancel!
    if (startEl !== e.target) return;

    var swipeThreshold = parseInt(startEl.getAttribute('data-swipe-threshold') || '20', 10); // default 10px
    var swipeTimeout = parseInt(startEl.getAttribute('data-swipe-timeout') || '500', 10); // default 1000ms
    var timeDiff = Date.now() - timeDown;
    var eventType = '';

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
      if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (xDiff > 0) {
          eventType = 'swiped-left';
        } else {
          eventType = 'swiped-right';
        }
      }
    } else {
      if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (yDiff > 0) {
          eventType = 'swiped-up';
        } else {
          eventType = 'swiped-down';
        }
      }
    }

    if (eventType !== '') {

      // fire event on the element that started the swipe
      startEl.dispatchEvent(new CustomEvent(eventType, {
        bubbles: true,
        cancelable: true
      }));

      // if (console && console.log) console.log(eventType + ' fired on ' + startEl.tagName);
    }

    // reset values
    xDown = null;
    yDown = null;
    timeDown = null;
  }

  function handleTouchStart(e) {

    // if the element has data-swipe-ignore="true" we stop listening for swipe events
    if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

    startEl = e.target;

    timeDown = Date.now();
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
    xDiff = 0;
    yDiff = 0;
  }

  function handleTouchMove(e) {

    if (!xDown || !yDown) return;

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    xDiff = xDown - xUp;
    yDiff = yDown - yUp;
  }

}(window, document));



// MAIN.JS //



// Load the service worker and register it
window.addEventListener("load", () => {
  registerSW();
});

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log(`SW registration failed`);
    }
  }
}


// Load the new video on the first load
window.addEventListener("load", () => {
  newVideo();
});

// Detect iOS and if it is, add the crossorigin to the video player so that it is working as expected
  if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Mac') != -1 && navigator.userAgent.indexOf('Chrome') == -1){
    document.getElementById("videoEl").setAttribute("crossorigin", "true");
};

// Video source for getting videos
const srcRaw = "https://raw.githubusercontent.com/ondersumer07/vinematik-videos/master/vid/";

// Create the random ids for videos to load
let videoids = []

function randomNum() {
  let rando = Math.floor((Math.random() * 3970) + 1);
  return rando;
};

// New video section

// Push the new video source to the HTML and push the ID to the array
function newVideo() {
  let videoid = randomNum()
  document.getElementById("vsrc").src = srcRaw + videoid + ".mp4";
  document.getElementById("videoEl").load();
  videoids.push(videoid);
  console.log(videoids);
  console.log(videoids.last());
};

// Start a new video by swiping left
document.addEventListener('swiped-left', function(e) {
  newVideo()
});

// Start a new video by cliking right arrow key
document.addEventListener("keydown", function(e) {
  const key = event.key;
  switch (key) {
    case "ArrowRight":
      newVideo()
      break;
    default:

  }
});



// Previous video section

// Add new last() method
if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 2];
  };
};

// Function for going to the previous video
function prevVideo() {
  document.getElementById("vsrc").src = srcRaw + videoids.last() + ".mp4";
  document.getElementById("videoEl").load();
  videoids.push(videoids.last());
}

// Go back to the previous video by pressing left arrow button
document.addEventListener("keydown", function(e) {
  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      prevVideo()
      break;
    default:

  }
});

// Go back to the previous video by swiping right
document.addEventListener('swiped-right', function(e) {
  prevVideo()
});

// Start a new video when the current one ended
document.getElementById("videoEl").addEventListener("ended", newVideo, false);
