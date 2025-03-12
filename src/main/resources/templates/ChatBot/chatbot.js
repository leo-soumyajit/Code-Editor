document.addEventListener("DOMContentLoaded", function () {
  // Show splash screen for 2 seconds, then display the chat container
  const splash = document.getElementById("splash");
  const chatContainer = document.getElementById("chat-container");
  setTimeout(function () {
    splash.style.display = "none";
    chatContainer.style.display = "flex";
  }, 2000);

  const chatLog = document.getElementById("chat-log");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  console.log("Nocturne AI loaded.");

  // Append a message to the chat log
  function appendChatMessage(message, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");

    if (sender === "bot") {
      msgDiv.innerHTML = formatAIResponse(message);
      // If Prism.js is available, highlight code inside this message
      if (window.Prism) {
        Prism.highlightAllUnder(msgDiv);
      }
    } else {
      msgDiv.textContent = message;
    }

    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Show "Nocturne AI is thinking..." indicator
  function showTypingIndicator() {
    removeTypingIndicator(); // Ensure no duplicate indicators
    const indicator = document.createElement("div");
    indicator.classList.add("chat-message", "bot", "typing");
    indicator.id = "typing-indicator-temp";
    indicator.innerHTML = `<span class="typing-dots">• • •</span> Nocturne AI is thinking...`;
    chatLog.appendChild(indicator);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Remove the typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator-temp");
    if (indicator) {
      indicator.remove();
    }
  }

  // Format AI responses:
  //   - Bold headers in non-code segments (lines starting with "#" become bold)
  //   - Wrap code blocks (content between triple backticks) in <pre><code> blocks with a "Copy" button
  //   - Replace newline characters with <br> only in non-code segments
  function formatAIResponse(response) {
    if (!response) return "";
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let result = "";
    let match;

    // Process each code block separately
    while ((match = codeRegex.exec(response)) !== null) {
      // Process text before this code block (apply bolding and newline conversion)
      let beforeCode = response.substring(lastIndex, match.index);
      beforeCode = beforeCode.replace(/^\s*#\s*(.+)$/gm, "<b>$1</b>");
      beforeCode = beforeCode.replace(/\n/g, "<br>");
      result += beforeCode;

      // Process the code block itself (preserve newlines)
      let lang = match[1] || "plaintext";
      let codeContent = escapeHTML(match[2]); // escape HTML
      result += `<div class="code-block">
                   <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                   <pre><code class="language-${lang}">${codeContent}</code></pre>
                 </div>`;
      lastIndex = codeRegex.lastIndex;
    }

    // Process any remaining text after the last code block
    let afterCode = response.substring(lastIndex);
    afterCode = afterCode.replace(/^\s*#\s*(.+)$/gm, "<b>$1</b>");
    afterCode = afterCode.replace(/\n/g, "<br>");
    result += afterCode;
    return result;
  }

  // Escape HTML characters to prevent injection
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }

  // Global copy function to copy code content when copy button is clicked.
  window.copyCode = function (button) {
    const codeBlock = button.parentElement.querySelector("pre code");
    if (codeBlock) {
      const textToCopy = codeBlock.innerText || codeBlock.textContent;
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          button.innerText = "Copied!";
          setTimeout(() => { button.innerText = "Copy"; }, 2000);
        })
        .catch(err => console.error("Failed to copy text: ", err));
    } else {
      console.error("No code block found for the copy button.");
    }
  };

  // Send the user's message to the backend and display the AI response
  async function sendChatMessage(message) {
    if (!message) return;
    appendChatMessage(message, "user");
    chatInput.value = "";
    showTypingIndicator();
    try {
      const response = await fetch("http://localhost:1010/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const result = await response.json();
      const botResponse = result.data && result.data.response
                          ? result.data.response
                          : "Sorry, I couldn't process your request.";
      appendChatMessage(botResponse, "bot");
    } catch (error) {
      console.error("Error in Nocturne AI:", error);
      appendChatMessage("Error: " + error.message, "bot");
    } finally {
      removeTypingIndicator();
    }
  }

  // Handle sending messages (on click or Enter key)
  function handleSendMessage() {
    const message = chatInput.value.trim();
    sendChatMessage(message);
  }

  sendBtn.addEventListener("click", handleSendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });
});
