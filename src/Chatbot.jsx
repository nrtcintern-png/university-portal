import { useState } from "react";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

 const sendMessage = async () => {
    if (!input.trim()) return;
    const userInput = input;
    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: userInput }],
        }),
      });
      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {isOpen && (
        <div style={{
          width: 340, height: 450, background: "white",
          borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", marginBottom: 12,
          overflow: "hidden"
        }}>
          <div style={{
            background: "#1a237e", color: "white",
            padding: "14px 16px", fontWeight: "bold",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span>🤖 AI Assistant</span>
            <span onClick={() => setIsOpen(false)}
              style={{ cursor: "pointer", fontSize: 18 }}>✕</span>
          </div>

          <div style={{
            flex: 1, overflowY: "auto", padding: 12,
            background: "#f5f5f5", display: "flex", flexDirection: "column", gap: 8
          }}>
            {messages.length === 0 && (
              <p style={{ color: "#999", textAlign: "center", marginTop: 20 }}>
                Hi! How can I help you today? 👋
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  background: msg.role === "user" ? "#1a237e" : "white",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px", borderRadius: 12,
                  maxWidth: "80%", fontSize: 13,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: "left" }}>
                <span style={{ background: "white", padding: "8px 12px",
                  borderRadius: 12, fontSize: 13, color: "#999" }}>
                  Typing...
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", padding: 8, gap: 6, background: "white" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 20,
                border: "1px solid #ddd", fontSize: 13, outline: "none"
              }}
            />
            <button onClick={sendMessage} style={{
              background: "#1a237e", color: "white", border: "none",
              borderRadius: "50%", width: 36, height: 36,
              cursor: "pointer", fontSize: 16
            }}>➤</button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} style={{
        background: "#1a237e", color: "white", border: "none",
        borderRadius: "50%", width: 56, height: 56,
        cursor: "pointer", fontSize: 24, float: "right",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
      }}>
        {isOpen ? "✕" : "🤖"}
      </button>
    </div>
  );
}