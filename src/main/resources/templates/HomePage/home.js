// home.js

// Use window.onload to ensure everything (including assets) is loaded
window.onload = function() {
  console.log("Window fully loaded. Starting initialization...");

  // Check if VANTA is accessible
  if (typeof VANTA === "undefined") {
    console.error("VANTA is undefined. Please verify that vanta.net.min.js is loaded correctly.");
  } else {
    console.log("VANTA is defined.");
  }

  // Check if the hero element is present
  const heroEl = document.getElementById("hero");
  if (!heroEl) {
    console.error("Element with id 'hero' not found. Please update your HTML to include id='hero' in the hero section.");
  } else {
    console.log("Hero element found:", heroEl);

    // Initialize Vanta.NET
    VANTA.GLOBE({
      el: "#hero",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x3f7fff,
      color2: 0xfdfdfd,
      backgroundColor: 0x140e2b
    })
    console.log("VANTA.HALO initialized on #hero.");
  }
};

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
  if (!userCountElement) {
    console.error("User count element not found.");
    return;
  }
  if (userCountElement.dataset.animated === "true") {
    return;
  }
  animateCount("user-count", 0, 10500, 4000);
  userCountElement.dataset.animated = "true";
}

// Use IntersectionObserver to detect when the users-section scrolls into view
const userSection = document.querySelector('.users-section');
if (userSection) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log("Users section is now in view. Triggering count animation.");
        triggerUserCountAnimation();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(userSection);
} else {
  console.error("Element with class 'users-section' not found.");
}

// Neon ripple effect on mouse move
document.addEventListener('mousemove', function(e) {
  const ripple = document.createElement('div');
  ripple.classList.add('cursor-neon-ripple');
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => {
    ripple.remove();
  }, 2500);
});

// Uncomment the code below if you're using a loader overlay
/*
window.addEventListener("load", function() {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 50);
  }, 300);
});
*/
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");
  const nextBtn = document.getElementById("next-slide");
  const prevBtn = document.getElementById("prev-slide");
  let currentSlide = 0;
  const totalSlides = 4; // Total number of slides

  function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
  }

  nextBtn.addEventListener("click", function () {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlider();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  });
});

