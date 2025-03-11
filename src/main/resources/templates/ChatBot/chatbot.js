document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chat-log");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const typingIndicator = document.getElementById("typing-indicator");
    const closeChatbot = document.getElementById("close-chatbot");

    // Append message to chat
    function appendChatMessage(message, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        msgDiv.innerHTML = message;
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

    // Send Message
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

            // Format AI response (Bold headings)
            const formattedResponse = formatResponse(result.data.response);
            appendChatMessage(formattedResponse, "bot");

        } catch (error) {
            hideTyping();
            appendChatMessage("Error connecting to Nocturne AI.", "bot");
        }
    }

    // Format Response: Bold headers
    function formatResponse(response) {
        return response.replace(/(\b[A-Z][a-zA-Z\s]+):/g, "<b>$1</b>:");
    }

    // Event Listeners
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
    });

    closeChatbot.addEventListener("click", function () {
        document.querySelector(".chat-container").style.display = "none";
    });
});
