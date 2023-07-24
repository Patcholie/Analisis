  function TTS() {
    var text = document.getElementById('result-container');
    var TTS_Button = document.getElementById('tts-button');
  
    // Disable the button before speaking
    TTS_Button.setAttribute('disabled', 'true');
  
    console.log('negro');
    var msg = new SpeechSynthesisUtterance();
    msg.text = text.innerHTML;
  
    // When the speech synthesis is complete, re-enable the button
    msg.onend = function () {
      TTS_Button.removeAttribute('disabled');
    };
  
    window.speechSynthesis.speak(msg);
  }
  