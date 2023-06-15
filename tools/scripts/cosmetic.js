document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.page-selector a');
  var backgroundvideo = document.getElementById('background-video');

  
  // Change video playback rate based on mouse movement
  document.addEventListener('mousemove', function (event) {
    var distance = Math.sqrt(
      Math.pow(event.movementX, 2) +
      Math.pow(event.movementY, 2)
    );
      
    window.addEventListener('DOMContentLoaded', function() {
      var body = document.querySelector('body');
      body.classList.add('fade-in'); /* Add the "fade-in" class to body */
    });
        
    var minDistance = 0;
    var maxDistance = 100;
    var minPlaybackRate = 1;
    var maxPlaybackRate = 20;
    var playbackRate = minPlaybackRate + (
      (distance - minDistance) /
      (maxDistance - minDistance) *
      (maxPlaybackRate - minPlaybackRate)
    );

    backgroundvideo.playbackRate = playbackRate;
  })
  
  
});