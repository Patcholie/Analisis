(function() {
	//init
	var $toggleSignIn = document.querySelector('.showSignIn');
	var $toggleSignUp = document.querySelector('.showSignUp');
	var $choiceWrapper = document.querySelector('.form');
	
	//events
	$toggleSignUp.addEventListener('click', signUp);
	$toggleSignIn.addEventListener('click', signIn);
	
	function switchForm(formIndex) {
	  $choiceWrapper.setAttribute('data-choice', formIndex);
	}
	
	//-----------------------------//
	function signIn() {
	  switchForm(2);
	}
	
	function signUp() {
	  switchForm(1);
	}
	
  })();
  