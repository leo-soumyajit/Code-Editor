// Function to animate count from start to end for a given duration (in milliseconds)
function animateCount(id, start, end, duration) {
  const obj = document.getElementById(id);
  let current = start;
  const range = end - start;
  const increment = range / (duration / 50); // update every 50ms
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    obj.textContent = Math.floor(current);
  }, 50);
}

// Function that triggers the counting animation (ensuring it runs only once)
function triggerUserCountAnimation() {
  const userCountElement = document.getElementById("user-count");
  // Check if already animated (using a data attribute)
  if (userCountElement.dataset.animated === "true") {
    return;
  }
  animateCount("user-count", 0, 10500, 4000);
  userCountElement.dataset.animated = "true";
}

// Use IntersectionObserver to detect when the users-section scrolls into view
const userSection = document.querySelector('.users-section');
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      triggerUserCountAnimation();
      // Optionally, unobserve if you want it to run only once
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 }); // Trigger when 50% of the section is visible

if (userSection) {
  observer.observe(userSection);
}

document.addEventListener('mousemove', function(e) {
  // Create a new neon ripple element
  const ripple = document.createElement('div');
  ripple.classList.add('cursor-neon-ripple');

  // Position the ripple at the mouse coordinates
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';

  // Append the ripple to the document body
  document.body.appendChild(ripple);

  // Remove the ripple element after the animation finishes (2.5 seconds)
  setTimeout(() => {
    ripple.remove();
  }, 2500);
});


// When the window finishes loading, remove the loader overlay.
//window.addEventListener("load", function() {
//  const loader = document.getElementById("loader");
//  // Optionally, delay the removal for a smoother effect.
//  setTimeout(() => {
//    loader.style.opacity = "0";
//    // After a short delay, completely hide the loader.
//    setTimeout(() => {
//      loader.style.display = "none";
//    }, 50);
//  }, 300); // Loader shows for 3 seconds, adjust as needed.
//});
