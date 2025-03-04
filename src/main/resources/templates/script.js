// Mapping of language to the file name used for code execution
const fileMapping = {
  "java": "Main.java",
  "python": "Main.py",
  "c": "main.c",
  "cpp": "main.cpp"
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  // Define a custom theme (optional)
  monaco.editor.defineTheme('myCustomTheme', {
    base: 'vs-dark', // Use 'vs-dark' as a base
    inherit: true,
    rules: [
      { token: '', foreground: 'C8C8C8', background: '1E1E1E' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' }
    ],
    colors: {
      "editor.foreground": "#CCCCCC",
      "editor.background": "#1E1E1E",
      "editorCursor.foreground": "#AEAFAD",
      "editor.lineHighlightBackground": "#2A2A2A",
      "editorLineNumber.foreground": "#858585",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41"
    }
  });

  // Create the Monaco Editor instance
  const editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: '// Write your code here...',
    language: 'java',  // default language; will update as user selects another
    theme: 'vs-dark',  // default theme; can be changed by the user
    automaticLayout: true,
  });

  // Update editor language and file-name label when language changes:
  document.getElementById('language-select').addEventListener('change', function() {
    const selectedLang = this.value;
    monaco.editor.setModelLanguage(editor.getModel(), selectedLang === 'cpp' ? 'cpp' : selectedLang);
    document.getElementById('file-name').textContent = "File used: " + fileMapping[selectedLang];
  });

  // Change theme when the user selects a new theme
  document.getElementById('theme-select').addEventListener('change', function() {
    const selectedTheme = this.value;
    monaco.editor.setTheme(selectedTheme);
  });

  // Function to execute code via the backend API
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
        const outputEl = document.getElementById('output');
        outputEl.textContent = output;
      })
      .catch(error => {
        console.error('Error executing code:', error);
        const outputEl = document.getElementById('output');
        outputEl.textContent = "Error executing code.";
      });
  };
});
