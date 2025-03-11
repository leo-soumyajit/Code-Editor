document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chat-log");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const typingIndicator = document.getElementById("typing-indicator");

    // Append message to chat with proper formatting
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

    // Show Typing Indicator
    function showTyping() {
        typingIndicator.style.display = "flex";
    }

    function hideTyping() {
        typingIndicator.style.display = "none";
    }

    // Send Message to AI
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        appendChatMessage(message, "user");
        chatInput.value = "";

        showTyping();

        try {
            const response = await fetch("http://localhost:1010/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const result = await response.json();
            hideTyping();

            const formattedResponse = formatAIResponse(result.data.response);
            appendChatMessage(formattedResponse, "bot");

        } catch (error) {
            hideTyping();
            appendChatMessage("🚨 Error: Nocturne AI is currently unavailable.", "bot");
        }
    }

    // **🔥 Formatting AI Responses: Bold Headers + Code Blocks**
    function formatAIResponse(response) {
        // Convert headers (Example: "Title:" → **Title**)
        response = response.replace(/(\b[A-Z][a-zA-Z\s]+):/g, "<b>$1</b>:");

        // Detect and format **code blocks** (triple backticks)
        response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, lang, code) {
            return `<pre><code class="${lang || 'plaintext'}">${escapeHTML(code)}</code></pre>`;
        });

        // Convert single-line breaks to HTML line breaks
        response = response.replace(/\n/g, "<br>");

        return response;
    }

    // Escape HTML to prevent unwanted execution
    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Event Listeners
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
    });
});
