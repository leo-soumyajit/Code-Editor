// Mapping of language to file name used for execution.
const fileMapping = {
  "java": "Main.java",
  "python": "Main.py",
  "c": "main.c",
  "cpp": "main.cpp"
};

// Mapping of language to image icon source.
const languageImages = {
  "java": "Images/Java-Emblem-removebg-preview.png",
  "python": "Images/python.png",
  "c": "Images/clangLogo.png",
  "cpp": "Images/cpp.png"
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' }});
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

  // Create the Monaco Editor instance.
  const editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: '// Write your code here...',
    language: 'java',
    theme: 'vs-dark',
    automaticLayout: true
  });

  // Update editor language and file label (and language icon) when the language selector changes.
  document.getElementById('language-select').addEventListener('change', function() {
    const selectedLang = this.value;
    // Update the Monaco Editor language.
    monaco.editor.setModelLanguage(editor.getModel(), selectedLang === 'cpp' ? 'cpp' : selectedLang);
    // Update the "File used" text.
    document.getElementById('file-name').textContent = "File used: " + fileMapping[selectedLang];
    // Update the language icon.
    const langIcon = document.getElementById('language-icon');
    if (langIcon) {
      langIcon.src = languageImages[selectedLang];
    }
  });

  // Update theme when the theme selector changes.
  document.getElementById('theme-select').addEventListener('change', function() {
    const selectedTheme = this.value;
    monaco.editor.setTheme(selectedTheme);
  });

  // Function to execute code by calling the backend API.
  window.executeCode = function() {
    const code = editor.getValue();
    const language = document.getElementById('language-select').value;

    fetch('http://localhost:1010/api/code/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    })
      .then(response => response.text())
      .then(output => {
        document.getElementById('output').textContent = output;
      })
      .catch(error => {
        console.error('Error executing code:', error);
        document.getElementById('output').textContent = "Error executing code.";
      });
  };
});

// --------------------------
// Animated Background: Floating Code Tokens
// --------------------------
const codeTokens = [
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
  tokenEl.textContent = codeTokens[Math.floor(Math.random() * codeTokens.length)];

  // Random horizontal position (0% to 100%)
  tokenEl.style.left = Math.random() * 100 + '%';
  // Random font size between 14px and 28px
  tokenEl.style.fontSize = (14 + Math.random() * 14) + 'px';
  // Random animation duration between 10s and 30s
  const duration = 10 + Math.random() * 20;
  tokenEl.style.animationDuration = duration + 's';
  // Random starting vertical position above viewport
  tokenEl.style.top = (-Math.random() * 100) + 'px';

  animationContainer.appendChild(tokenEl);

  // Recreate token after animation completes
  setTimeout(() => {
    tokenEl.remove();
    createCodeToken();
  }, duration * 1000);
}

const tokenCount = 70;
for (let i = 0; i < tokenCount; i++) {
  createCodeToken();
}
