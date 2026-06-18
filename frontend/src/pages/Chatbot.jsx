import { useState, useEffect } from "react";
import "../styles/chatbot.css";
import { askChatbot } from "../services/chatbotService";
import API from "../services/api";

function Chatbot({ setBot }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Initialize messages from localStorage if they exist
  const [messages, setMessages] = useState(() => {
    const savedHistory = localStorage.getItem("chat_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // 2. Automatically save messages to localStorage whenever the array changes
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const ask = async () => {
    if (!question.trim()) return;

    const userMessage = question;

    // add user message
    setMessages((prev) => [
      ...prev,
      { type: "user", text: userMessage },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      let completedHistoryData = [];
      try {
        const historyRes = await API.get("/history");
        completedHistoryData = historyRes.data || [];
      } catch (err) {
        console.log("Failed to fetch history context for chatbot", err);
      }

      const res = await askChatbot(userMessage, completedHistoryData);

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: res.data.answer },
      ]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Clear conversation function
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([]);
      localStorage.removeItem("chat_history");
    }
  };

  return (
    <>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>AI Assistant</span>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Clear History Icon Button */}
            {messages.length > 0 && (
              <button 
                className="clear-btn" 
                onClick={handleClearHistory}
                title="Clear Chat History"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                🗑️
              </button>
            )}
            
            <button className="close-btn" onClick={() => setBot(false)}>
              ✖
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === "user" ? "user-message" : "bot-message"}
            >
              {msg.text}
            </div>
          ))}

          {/* Typing animation */}
          {loading && (
            <div className="bot-message dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
          />
          <button onClick={ask}>➤</button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;