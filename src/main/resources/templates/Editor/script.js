// --------------------------
// Authentication Check: Redirect if no access token is found.
// --------------------------
if (!localStorage.getItem('accessToken')) {
  window.location.href = '../HomePage/home.html';
}

// --------------------------
// Mapping and Boilerplate Data
// --------------------------
const fileMapping = {
  "java": "Main.java",
  "python": "Main.py",
  "c": "main.c",
  "cpp": "main.cpp"
};

const languageImages = {
  "java": "Images/Java-Emblem-removebg-preview.png",
  "python": "Images/python.png",
  "c": "Images/clangLogo.png",
  "cpp": "Images/cpp.png"
};

const boilerplateCodes = {
  "java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`,
  "python": `print("Hello, world!")`,
  "c": `#include <stdio.h>
int main() {
    printf("Hello, world!\\n");
    return 0;
}`,
  "cpp": `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`
};

// --------------------------
// Monaco Editor and Editor Functionality
// --------------------------
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' } });
require(['vs/editor/editor.main'], function() {
  // Define a custom theme (optional)
  monaco.editor.defineTheme('myCustomTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'C8C8C8', background: '1E1F1F' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' }
    ],
    colors: {
      "editor.foreground": "#CCCCCC",
      "editor.background": "#1E1F1F",
      "editorCursor.foreground": "#AEAFAD",
      "editor.lineHighlightBackground": "#2A2A2A",
      "editorLineNumber.foreground": "#858585",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41"
    }
  });

  const editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: boilerplateCodes["java"], // initial value is Java boilerplate
    language: 'java',
    theme: 'vs-dark',
    automaticLayout: true
  });


   // Set an initial font size; you can adjust this default value as needed.
    let currentFontSize = 14;
    editor.updateOptions({ fontSize: currentFontSize });

    // --------------------------
    // New: Text Size Increase/Decrease Functions.
    // --------------------------
    window.increaseFontSize = function() {
      currentFontSize += 2; // Increase font size by 2 points
      editor.updateOptions({ fontSize: currentFontSize });
    };

    window.decreaseFontSize = function() {
      // Ensure that the font doesn't get too small.
      if (currentFontSize > 8) {
        currentFontSize -= 2;
        editor.updateOptions({ fontSize: currentFontSize });
      }
    };



  // When language selector changes: update language, file label, language icon, and boilerplate.
  document.getElementById('language-select').addEventListener('change', function() {
    const selectedLang = this.value;
    monaco.editor.setModelLanguage(editor.getModel(), selectedLang === 'cpp' ? 'cpp' : selectedLang);
    document.getElementById('file-name').textContent = "File used: " + fileMapping[selectedLang];
    const langIcon = document.getElementById('language-icon');
    if (langIcon) {
      langIcon.src = languageImages[selectedLang];
    }
    editor.setValue(boilerplateCodes[selectedLang]);
  });

  // When theme selector changes: update theme.
  document.getElementById('theme-select').addEventListener('change', function() {
    const selectedTheme = this.value;
    monaco.editor.setTheme(selectedTheme);
  });

  // Function to execute code by calling your backend API.
  window.executeCode = function() {
    const code = editor.getValue();
    const language = document.getElementById('language-select').value;
    const accessToken = localStorage.getItem('accessToken');

    fetch('http://localhost:1010/api/code/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: JSON.stringify({ code, language })
    })
      .then(response => {
        // If the response is not OK, check for 401/403.
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            showPopup("Session expired! Redirecting to login in 3 seconds...", "error", true);
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(result => {
        let output = result.data || "";
        // Remove first line if it contains "File used:".
        const lines = output.split("\n");
        if (lines.length > 0 && lines[0].trim().startsWith("File used:")) {
          lines.shift();
          output = lines.join("\n").trim();
        }
        document.getElementById('output').textContent = output;
      })
      .catch(error => {
        console.error('Error executing code:', error);
        if (error.message !== "Network response was not ok") {
          showPopup("Error executing code.", "error");
        }
      });
  };

  // Function to reset the editor content to boilerplate code.
  window.resetCode = function() {
    const language = document.getElementById('language-select').value;
    editor.setValue(boilerplateCodes[language]);
  };
});

// --------------------------
// Animated Background: Floating Code Tokens
// --------------------------
const tokens = [
  "print", "#include<stdio.h>", "cout<<", "private", "if", "public static void main", "int main()", "printf",
  "function", "var", "const", "let", "if", "else", "for", "while",
  "switch", "case", "return", "try", "catch", "class", "extends",
  "import", "export", "void", "int", "float", "double", "boolean",
  "null", "undefined", "console.log()", "System.out.println()", "=>",
  "{", "}", "(", ")", "[", "]", ";", "//", "/*", "*/"
];

const animationContainer = document.querySelector('.code-animation');

function createCodeToken() {
  const tokenEl = document.createElement('div');
  tokenEl.className = 'code-line';
  tokenEl.textContent = tokens[Math.floor(Math.random() * tokens.length)];

  tokenEl.style.left = Math.random() * 100 + '%';
  tokenEl.style.fontSize = (14 + Math.random() * 14) + 'px';
  const duration = 10 + Math.random() * 20;
  tokenEl.style.animationDuration = duration + 's';
  tokenEl.style.top = (-Math.random() * 100) + 'px';

  animationContainer.appendChild(tokenEl);

  setTimeout(() => {
    tokenEl.remove();
    createCodeToken();
  }, duration * 1000);
}

const tokenCount = 70;
for (let i = 0; i < tokenCount; i++) {
  createCodeToken();
}

// --------------------------
// Total Active Users Counting Animation
// --------------------------
function animateCount(id, start, end, duration) {
  const obj = document.getElementById(id);
  let current = start;
  const range = end - start;
  const increment = range / (duration / 50);
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    obj.textContent = Math.floor(current) + "+";
  }, 50);
}

// Wait for DOM to load before observing the users-section.
document.addEventListener('DOMContentLoaded', () => {
  const userSection = document.querySelector('.users-section');
  if (userSection) {
    let hasAnimated = false;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateCount("user-count", 0, 10500, 4000);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(userSection);
  } else {
    console.error("Users section not found.");
  }
});

// --------------------------
// Popup Function (Overlay at Right Corner with Countdown)
// --------------------------
function showPopup(message, type, redirect = false) {
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  const popupTimer = document.getElementById('popup-timer');

  popupMessage.textContent = message;
  popup.style.display = 'block';

  if (redirect) {
    let seconds = 3;
    popupTimer.textContent = "Redirecting in " + seconds + " seconds...";
    const interval = setInterval(() => {
      seconds--;
      popupTimer.textContent = "Redirecting in " + seconds + " seconds...";
      if (seconds <= 0) {
        clearInterval(interval);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userid');
        window.location.href = '../LoginAndSignup/auth.html';
      }
    }, 1000);
  } else {
    popupTimer.textContent = "";
  }

  const closeBtn = document.getElementsByClassName('close')[0];
  closeBtn.onclick = () => { popup.style.display = 'none'; };

  window.onclick = (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  };
}