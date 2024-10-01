import { useState } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { BiSend } from "react-icons/bi";
import { AiOutlineReload } from "react-icons/ai";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const userMessage = { type: "user", text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion(""); 

    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDERfqLZCOMtT_AOfq6ZPPNj5eJ0sAzdj8",
        method: "post",
        data: { contents: [{ parts: [{ text: question }] }] },
      });

      const aiMessage = {
        type: "ai",
        text: response["data"]["candidates"][0]["content"]["parts"][0]["text"],
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { type: "error", text: "Sorry mate - Something something wrong happening. Please try again!" },
      ]);
    }

    setGeneratingAnswer(false);
  }

  function resetChat() {
    setChatHistory([]);
    setQuestion("");
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen flex flex-col justify-between items-center p-3">
      <div className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-500 mb-4">Chat AI</h1>
          <button
            onClick={resetChat}
            className="flex items-center justify-center text-blue-500 hover:text-red-500"
          >
            <AiOutlineReload size={24} />
            <span className="ml-2">Reset Chat</span>
          </button>
        </header>

        <div className="chat-window overflow-y-auto h-72 bg-gray-100 p-3 rounded-md">
          {chatHistory.length === 0 && <p className="text-gray-500">Ask something to start the conversation...</p>}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.type === "user" ? "user-message" : "ai-message"} my-2`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
        </div>

        <form onSubmit={generateAnswer} className="flex space-x-2">
          <textarea
            className="flex-1 p-2 border border-gray-300 rounded-md focus:border-blue-500"
            placeholder="Ask anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={generatingAnswer}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-all duration-300 flex items-center justify-center ${
              generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={generatingAnswer}
          >
            <BiSend size={24} />
          </button>
        </form>

        {generatingAnswer && <p className="text-gray-500">Loading... Please wait.</p>}
      </div>
    </div>
  );
}

export default App;
