// Authentication Check: Redirect if no access token is found.
if (!localStorage.getItem('accessToken')) {
  window.location.href = '../HomePage/home.html';
}

// Ensure the loader is hidden on page load.
window.onload = function() {
  hideLoader();
};

// Mapping and Boilerplate Data
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

// Loader Functions
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

// General Popup Function for messages (existing)
function showPopup(message, type, redirect) {
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
        window.location.href = '../LoginAndSignup/auth.html';
      }
    }, 1000);
  }
}

// Enhanced helper function to format analysis text.
// Any line starting with "#" OR ending with ":" is considered a header and will be wrapped in <strong> tags.
function formatAnalysisText(text) {
  return text.split("\n").map(line => {
    // Check if the line is a header by two heuristics:
    // 1. It starts with one or more "#"
    // 2. Or, it ends with a colon (":")
    if (/^\s*#/.test(line) || line.trim().endsWith(":")) {
      // Remove leading '#' and extra whitespace if present
      const headingText = line.replace(/^\s*#+\s*/, "").trim();
      return `<strong>${headingText}</strong>`;
    }
    return line;
  }).join("<br>");
}

// New Analysis Popup Function
function displayAnalysisPopup(message) {
  const analysisPopup = document.getElementById('popup-analysis');
  const analysisMessage = document.getElementById('popup-analysis-message');
  const formattedMessage = formatAnalysisText(message);
  analysisMessage.innerHTML = formattedMessage;
  analysisPopup.style.display = 'flex';
}

// Close the new analysis popup when its close button is clicked.
document.querySelector('.close-analysis').addEventListener('click', function() {
  document.getElementById('popup-analysis').style.display = 'none';
});

// Monaco Editor Setup
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' } });
require(['vs/editor/editor.main'], function() {
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
    value: boilerplateCodes["java"],
    language: 'java',
    theme: 'vs-dark',
    automaticLayout: true
  });

  window.editor = editor;

  let currentFontSize = 14;
  editor.updateOptions({ fontSize: currentFontSize });

  window.increaseFontSize = function() {
    currentFontSize += 2;
    editor.updateOptions({ fontSize: currentFontSize });
  };

  window.decreaseFontSize = function() {
    if (currentFontSize > 8) {
      currentFontSize -= 2;
      editor.updateOptions({ fontSize: currentFontSize });
    }
  };

  document.getElementById('language-select').addEventListener('change', function() {
    const selectedLang = this.value;
    monaco.editor.setModelLanguage(editor.getModel(), (selectedLang === 'cpp') ? 'cpp' : selectedLang);
    document.getElementById('file-name').textContent = "File used: " + fileMapping[selectedLang];
    document.getElementById('language-icon').src = languageImages[selectedLang];
    editor.setValue(boilerplateCodes[selectedLang]);
  });

  document.getElementById('theme-select').addEventListener('change', function() {
    const selectedTheme = this.value;
    monaco.editor.setTheme(selectedTheme);
  });

  // Function to Execute Code via the Backend API
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

  // Function to Reset Code (Restore Boilerplate)
  window.resetCode = function() {
    const language = document.getElementById('language-select').value;
    editor.setValue(boilerplateCodes[language]);
  };

  // AI Autocomplete Function with Delayed Loader
  window.autocomplete = async function() {
    const loaderDelay = 600;
    let loaderTimeout = setTimeout(showLoader, loaderDelay);
    try {
      const userInput = editor.getValue();
      const response = await fetch('http://localhost:1010/api/code/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userInput })
      });
      const result = await response.json();
      const suggestion = result.data || "";
      const position = editor.getPosition();
      editor.executeEdits("insert-autocomplete", [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: suggestion,
        forceMoveMarkers: true
      }]);
    } catch (error) {
      console.error("Error in autocomplete:", error);
      document.getElementById("output").textContent = "Error in autocomplete: " + error;
    } finally {
      clearTimeout(loaderTimeout);
      hideLoader();
    }
  };

  // AI Code Analysis Function with Delayed Loader and New Analysis Popup Display
  window.codeAnalysis = async function() {
    const loaderDelay = 600;
    let loaderTimeout = setTimeout(showLoader, loaderDelay);
    try {
      const code = editor.getValue();
      const response = await fetch('http://localhost:1010/api/code/code-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      const analysis = result.data || "";
      // Display analysis result in the new popup with formatted headings.
      displayAnalysisPopup("Code Analysis:\n" + analysis);
    } catch (error) {
      console.error("Error in code analysis:", error);
      displayAnalysisPopup("Error in code analysis: " + error);
    } finally {
      clearTimeout(loaderTimeout);
      hideLoader();
    }
  };

  // Animated Background: Floating Code Tokens
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
});
