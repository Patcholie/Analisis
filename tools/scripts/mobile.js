function playSound() {
    var sound = document.getElementById("sound");
    var randomVolume = Math.random() * (1 - 0.5) + 0.5; // Random volume between 0.5 and 1
    sound.volume = randomVolume;
    sound.currentTime = 0;
    sound.play();
  }

  function shakeLogo() {
    var logo = document.getElementById("logo");
    
    logo.style.animation = "shake 0.5s";
    logo.style.animationIterationCount = "1";
    logo.style.animationTimingFunction = "ease-in-out";
    logo.addEventListener("animationend", function() {
      logo.style.animation = "none";
      playSound();
    });
  }

  var logo = document.getElementById("logo");
  logo.addEventListener("click", shakeLogo);


  function TTS() {
    var text = document.getElementById('result-container');
    var TTS_Button = document.getElementById('tts-button');
  
    // Disable the button before speaking
    TTS_Button.setAttribute('disabled', 'true');
  
    console.log('negro');
    var msg = new SpeechSynthesisUtterance();
    msg.text = text.innerText;
  
    // When the speech synthesis is complete, re-enable the button
    msg.onend = function () {
      TTS_Button.removeAttribute('disabled');
    };
  
    window.speechSynthesis.speak(msg);
  }
  
