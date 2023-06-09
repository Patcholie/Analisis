// Declare BodyPart variable at the top level
let BodyPart;

function handleButtonClick(buttonNumber) {
  // Remove highlight class from all buttons
  BodyPart = buttonNumber; // Assign the buttonNumber to BodyPart
  console.log(BodyPart.toString());
  var buttons = document.getElementsByClassName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("highlight");
  }
  
  // Add highlight class to the selected button
  var selectedButton = document.getElementById("button" + buttonNumber);
  selectedButton.classList.add("highlight");
}


document.addEventListener('DOMContentLoaded', function () {
  // Elements
  var links = document.querySelectorAll('.page-selector a');
  var backgroundvideo = document.getElementById('background-video');
  var plus = document.querySelector('.plus-sign');
  const resultContainer = document.getElementById("result-container");
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const confirmationSound = new Audio('assets/audio/confirmation.mp3');
  const successSound = new Audio('assets/audio/success.wav');
  const errorSound = new Audio('assets/audio/error.mp3');
  const slider = document.getElementById('myRange');
  const painLevel = document.getElementById('slider-value');
  const textArea = document.getElementById('text-area');
  
  // Adjust sound volumes
  successSound.volume = 0.5;
  confirmationSound.volume = 0.7;
  errorSound.volume = 0.5;
  
  // Fade-in effect on page load
  window.addEventListener('load', function () {
    const content = document.querySelector('.content');
    content.classList.add('fade-in');
  });
  
  // Function to load a new page
  function loadPage(href) {
    var content = document.querySelector('.content');
    content.style.opacity = 0;
    
    setTimeout(function () {
      window.location.href = href;
    }, 500);
  }
  
  // Attach click event listeners to page links
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      loadPage(href);
    });
  }





  // Set the initial playback rate of the video to 1x
  backgroundvideo.playbackRate = 1;
  
  // Change video playback rate based on mouse movement
  document.addEventListener('mousemove', function (event) {
    var distance = Math.sqrt(
      Math.pow(event.movementX, 2) +
      Math.pow(event.movementY, 2)
    );
      
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
  });

  // Camera detection
  let cameraDetected = true;

  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { width: 500, height: 500 } })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        cameraDetected = false;
        console.log('Error: ' + err);
        plus.textContent = 'Camera Not Detected!';
      });
  }
  
  // Update pain level text based on slider value
  function updatePainLevel() {
    const painLevelText = {
      0: "No pain at all",
      1: "Very mild pain (barely noticeable)",
      2: "Mild pain (discomforting but can be ignored)",
      3: "Moderate pain (interferes with daily activities)",
      4: "Moderate to severe pain (limits daily activities)",
      5: "Severe pain, might require pain relief (unable to perform daily activities)",
      6: "Severe to excruciating pain, need pain relief immediately (disrupts sleep)",
      7: "Excruciating pain, need to go to the doctor (unable to concentrate)",
      8: "Intense pain, need to go to the emergency room (causes nausea and vomiting)",
      9: "Very intense pain, paramedics are required immediately (causes physical shock)",
      10: "Worst pain, paramedics are required immediately (may lead to unconsciousness)"
    };
    
    const painLevelValue = slider.value;
    painLevel.textContent = painLevelText[painLevelValue];
  }
  
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'y') {
      analyze();
    }
  });
  
  // Analyze function
  function analyze() {
    if (!cameraDetected) {
      console.log("Camera not detected. Analysis cannot be performed.");
      plus.textContent = 'Camera Not Detected!';
      errorSound.play();
      return;
    }
    
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    const painLevelValue = slider.value;
    const notes = textArea.value;
    
    confirmationSound.play();
    resultContainer.style.display = 'block';
    
    let dots = '';
    let intervalId = setInterval(function () {
      if (dots.length > 3) {
        dots = '';
      }
      dots += '.';
      resultContainer.innerHTML = `<p>Loading Treatment${dots}</p>`;
    }, 500);
    
    resultContainer.scrollIntoView({ behavior: 'smooth' });
    
    $.ajax({
      url: 'http://44.198.240.54:8000/pass_to_backend',
      type: 'POST',
      data: JSON.stringify({ image: imageData, text: notes, sliderValue: painLevelValue, bodyPart: BodyPart}),
      contentType: 'application/json',
      success: function (response) {
        console.log(response);
        clearInterval(intervalId);
        resultContainer.innerHTML = '';
        const steps = response.split('\n');
        let formattedSteps = '';
        for (let i = 0; i < steps.length; i++) {
          if (steps[i].trim() !== '') {
            if (/^\d+\./.test(steps[i])) {
              formattedSteps += '<br> <br>' + steps[i] + ' ';
            } else {
              formattedSteps += steps[i] + '<br>';
            }
          }
        }
        resultContainer.innerHTML = formattedSteps.substring(9);
        const lines = resultContainer.offsetHeight / parseFloat(getComputedStyle(resultContainer).lineHeight);
        resultContainer.style.height = `${lines * 1.2}em`;
        resultContainer.classList.toggle('visible');
        document.body.style.height = 'auto';
        document.body.style.overflow = 'auto';
        successSound.play();
  
      },
      error: function (error) {
        console.error(error);
        clearInterval(intervalId);
        document.body.style.height = 'auto';
        document.body.style.overflow = 'auto';
        resultContainer.innerHTML = "Error!!! \n \nPlease select a Body Part and make sure your camera is activated. \n(If you selected a Body Part and the camera is on, The error is an Internal Server Error.)\n"
        resultContainer.style.fontSize = '1.3em';

        errorSound.play();
      },
    });
  }
  
  // Initialization
  startCamera();
  slider.addEventListener('input', updatePainLevel);
  document.getElementById('analyze-button').addEventListener('click', analyze);

  // Ensure that video has loaded metadata before trying to draw it to canvas
  video.addEventListener('loadedmetadata', function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
  var clickCount = 0;

  function ActivateGoof() {
    // Create an audio element and set its source to the desired sound file
    var audio = new Audio('assets\\audio\\EasterEgg.mp3');
    var game = 'https://www.crazygames.com/game/monster-hospital'
    window.open(game, '_blank'); // Open link in a new tab or window

    // Play the sound
    audio.play();
  }

  document.getElementById('treat').addEventListener('click', function() {
    clickCount++;

    if (clickCount === 20) {
      console.log('Activating Stimulation.')
      clickCount = 0;
      ActivateGoof();
    }
  });

});
