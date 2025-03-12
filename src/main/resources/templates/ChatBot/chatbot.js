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
  const typingIndicator = document.getElementById("typing-indicator");

  console.log("Nocturne AI loaded.");

  // Append a message to the chat log
  function appendChatMessage(message, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");

    if (sender === "bot") {
      msgDiv.innerHTML = formatAIResponse(message);
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
  // - Bold headers (lines starting with "#" will be made bold)
  // - Wrap code blocks (content between triple backticks) in <pre><code>
  // - Convert newlines to <br>
  function formatAIResponse(response) {
    if (!response) return "";
    // Bold headers: any line that starts with "#" (ignoring leading whitespace)
    response = response.replace(/^\s*#\s*(.+)$/gm, "<b>$1</b>");
    // Format code blocks (```lang ... ```)
    response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, lang, code) {
      return `<pre><code class="language-${lang || "plaintext"}">${escapeHTML(code)}</code></pre>`;
    });
    // Replace newline characters with <br>
    return response.replace(/\n/g, "<br>");
  }

  // Escape HTML characters to prevent injection
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }

  // Send the user's message to the backend and display the AI response
  async function sendChatMessage(message) {
    if (!message) return;

    // Append user's message and clear input
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
      removeTypingIndicator();

      // Extract the chatbot's response from result.data.response
      const botResponse = result.data && result.data.response
                          ? result.data.response
                          : "Sorry, I couldn't process your request.";
      appendChatMessage(botResponse, "bot");
    } catch (error) {
      console.error("Error in Nocturne AI:", error);
      removeTypingIndicator();
      appendChatMessage("Error: " + error.message, "bot");
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
