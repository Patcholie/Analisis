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
