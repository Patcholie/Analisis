  
// Logo
function startAnimation() {
    // Get all the elements that need to be animated
    const elementsToAnimate = document.querySelectorAll('.main-text-header, .line-1, .line-2, .line-3, .line-4, .line-5, .team-members-header, .team-members, .team-member-image, .agreement');
  
    // Loop through the elements and add the "show" class with a delay between each element
    let delay = 0;
    elementsToAnimate.forEach((element) => {
      setTimeout(() => {
        element.classList.toggle('show');
      }, delay);
      delay += 200; // Adjust the delay time (in milliseconds) to control the animation speed
    });
  }
  
document.addEventListener("DOMContentLoaded", function () {
  const logo = document.getElementById("logo");
  const activator = document.getElementById("logo-holder");

  let originalSrc = logo.src; 

  activator.addEventListener("click", function () {
    startAnimation();
      logo.classList.add("animate_logo");

      setTimeout(function () {
          logo.classList.remove('animate_logo');
      }, 1050);
      
      if (logo.classList.contains("playing")) {
          logo.src = "assets/animations/analisis-logo.gif";
          logo.classList.remove("playing");

          setTimeout(function () {
              logo.src = originalSrc;
          }, 800);
      } else {
          logo.src = "assets/animations/analisis-logo.gif";
          logo.classList.add("playing");

          setTimeout(function () {
              logo.src = originalSrc;
          }, 800);
      }
  });
});
