
let BodyPart; // Represents the selected body part
let dots = ""; // Used for loading animation
let cameraDetected = true; // Indicates if the camera is detected
// Function to handle button clicks
function handleButtonClick(buttonNumber) {
  BodyPart = buttonNumber; // Assign the buttonNumber to BodyPart
  console.log(BodyPart.toString()); // Log the selected body part
  var buttons = document.getElementsByClassName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("highlight"); // Remove highlight class from all buttons
  }

  // Add highlight class to the selected button
  var selectedButton = document.getElementById("button" + buttonNumber);
  selectedButton.classList.add("highlight");
}
// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  
  // Elements
  var plus = document.querySelector(".plus-sign");
  const resultContainer = document.getElementById("result-container");
  const TTS_Button = document.getElementById("tts-button");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const confirmationSound = new Audio("assets/audio/confirmation.mp3");
  const successSound = new Audio("assets/audio/success.wav");
  const errorSound = new Audio("assets/audio/error.mp3");
  const slider = document.getElementById("myRange");
  const painLevel = document.getElementById("slider-value");
  const textArea = document.getElementById("text-area");

  // Adjust sound volumes
  successSound.volume = 0.5;
  confirmationSound.volume = 0.7;
  errorSound.volume = 0.5;

  // Function to start the camera
  function startCamera() {
    let supports = navigator.mediaDevices.getSupportedConstraints();
    
    if (supports['facingMode']) {
      let constraints = {
        video: {
          width: 500,
          height: 500,
          facingMode: 'environment'
        }
      };
      
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          cameraDetected = false;
          console.log("Error: " + err);
          plus.textContent = "Camera Not Detected!";
        });
    } else {
      console.log('Facing mode not supported');
    }
  }
  
  // Function to update the pain level text based on the slider value
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
      10: "Worst pain, paramedics are required immediately (may lead to unconsciousness)",
    };

    const painLevelValue = slider.value;
    painLevel.textContent = painLevelText[painLevelValue];
  }

  // Event listener for Ctrl + Y keydown event to trigger analysis
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && (event.key === "i" || event.key === "I")) {
      analyze();
    }
  });

  // Function to perform analysis
  function analyze() {
    if (!cameraDetected) {
      console.log("Camera not detected. Analysis cannot be performed.");
      plus.textContent = "Camera Not Detected!";
      errorSound.play();
      return;
    }

    // Capture image from the video and convert it to base64 data URL
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    const painLevelValue = slider.value;
    const notes = textArea.value;

    confirmationSound.play();
    resultContainer.style.display = "block";
    if (TTS_Button) {
      TTS_Button.style.display = "block";
    } else {
      console.log("DEVICE: PC");
    }
    

    // Show loading animation
    let intervalId = setInterval(function () {
      if (dots.length > 3) {
        dots = "";
      }
      dots += ".";
      resultContainer.innerHTML = `<p>Loading Treatment${dots}</p>`;
    }, 500);

    resultContainer.scrollIntoView({ behavior: "smooth" });

    // Send AJAX request to the backend for analysis
    $.ajax({
      url: "https://analisis-medical.com:8000/backend/pass_to_backend",
      type: "POST",
      data: JSON.stringify({
        image: imageData,
        text: notes,
        sliderValue: painLevelValue,
        bodyPart: BodyPart,
      }),
      contentType: "application/json",
      success: function (response) {
        console.log(response);
        clearInterval(intervalId);
        resultContainer.innerHTML = "";
        const steps = response.split("\n");
        let formattedSteps = "";
        for (let i = 0; i < steps.length; i++) {
          if (steps[i].trim() !== "") {
            if (/^\d+\./.test(steps[i])) {
              formattedSteps += "<br> <br>" + steps[i] + " ";
            } else {
              formattedSteps += steps[i] + "<br>";
            }
          }
        }
        resultContainer.innerHTML = formattedSteps.substring(9);
        const lines =
          resultContainer.offsetHeight /
          parseFloat(getComputedStyle(resultContainer).lineHeight);
        resultContainer.style.height = `${lines * 1.2}em`;
        resultContainer.classList.toggle("visible");
        document.body.style.height = "auto";
        document.body.style.overflow = "auto";
        successSound.play();
      },
      error: function (error) {
        console.error(error);
        clearInterval(intervalId);
        document.body.style.height = "auto";
        document.body.style.overflow = "auto";
        resultContainer.innerHTML =
          "Error!!! \n \nThe Server Had An Error Processing This Request, The Server Might Be Unavailable.\n";
        resultContainer.style.fontSize = "1.3em";
        errorSound.play();
      },
    });
  }

  // Initialization
  startCamera();
  slider.addEventListener("input", updatePainLevel);
  document.getElementById("analyze-button").addEventListener("click", analyze);

  // Ensure that video has loaded metadata before trying to draw it to canvas
  video.addEventListener("loadedmetadata", function () {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });

  var clickCount = 0;

  // Function to activate goof stimulation
  function ActivateGoof() {
    // Create an audio element and set its source to the desired sound file
    var audio = new Audio("assets\\audio\\EasterEgg.mp3");
    var game = "https://www.crazygames.com/game/monster-hospital";
    window.open(game, "_blank"); // Open link in a new tab or window
    audio.play(); // Play the sound
  }

  // Event listener for the treatment container click
  document.getElementById("treat").addEventListener("click", function () {
    clickCount++;
    if (clickCount === 20) {
      console.log("Activating Stimulation.");
      clickCount = 0;
      ActivateGoof();
    }
  });
});

