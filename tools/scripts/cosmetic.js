const swup = new Swup();

// Animation for scroll effects //
const animation_elements = document.querySelectorAll('.animate-on-scroll, .animate-top-down');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('scroll-up');
    } else {
      entry.target.classList.remove('scroll-up');
    }
  });
}, {
  threshold: 0.5
});

for (let i = 0; i < animation_elements.length; i++) {
  const el = animation_elements[i];
  observer.observe(el);
}

function highlight_upper() {
  // Remove the 'highlight' class from all anchor elements
  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove('highlight-selector');
  }

  // Add the 'highlight' class to the clicked anchor element
  event.target.classList.add('highlight-selector');
}

var links = document.querySelectorAll('.page-selector a');
var backgroundvideo = document.getElementById('background-video');

// Change video playback rate based on mouse movement
document.addEventListener('mousemove', function (event) {
  var distance = Math.sqrt(
    Math.pow(event.movementX, 2) +
    Math.pow(event.movementY, 2)
  );

  window.addEventListener('DOMContentLoaded', function () {
    var body = document.querySelector('body');
    body.classList.add('fade-in'); /* Add the "fade-in" class to body */
  });

  var minDistance = 0;
  var maxDistance = 100;
  var minPlaybackRate = 1;
  var maxPlaybackRate = 25;
  var playbackRate = minPlaybackRate + (
    (distance - minDistance) /
    (maxDistance - minDistance) *
    (maxPlaybackRate - minPlaybackRate)
  );

  try {
    backgroundvideo.playbackRate = parseInt(playbackRate);
  } catch (error) {
    // Handle the error without revealing specific details
    console.log('Error:', error);
  }
});

swup.on('animationInDone', () => {
  loadScript('tools/scripts/app.js');
  console.log('Content Replaced');
  if (window.location.href.endsWith('index.html')) {
    // Reload the page
    location.reload();
  }
});

function loadScript(url) {
  const script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
}

// Function to check if the user is using a mobile device
function isMobileDevice() {
  return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Function to access the rear camera on mobile devices
function accessRearCamera() {
  // Check if the device supports media devices and getUserMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Constraints to access the rear camera
    const constraints = {
      video: { facingMode: { exact: 'environment' } }
    };

    // Access the rear camera
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        // Success callback, handle the stream or perform any necessary actions
        console.log('Rear camera access successful');
      })
      .catch((error) => {
        // Error callback, handle the error or display an error message
        console.log('Error accessing rear camera:', error);
      });
  } else {
    // Media devices or getUserMedia not supported
    console.log('Media devices or getUserMedia not supported on this device');
  }
}

// Call the accessRearCamera function when the page loads on a mobile device
if (isMobileDevice()) {
  window.addEventListener('DOMContentLoaded', accessRearCamera);
}
