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
