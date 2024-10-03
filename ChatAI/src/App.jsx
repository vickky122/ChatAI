import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { BiSend } from "react-icons/bi";
import { AiOutlineReload } from "react-icons/ai";
import { FaPlusCircle } from "react-icons/fa";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [scrolling, setScrolling] = useState(false); 
  const chatWindowRef = useRef(null);

  // heading movement after submitting and questino 
  const [hasAsked, setHasAsked] = useState(false);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    setHasAsked(true);
    const userMessage = { type: "user", text: question };
    const updatedHistory = [...(activeChat?.messages || []), userMessage];

    const newChat = activeChat
      ? { ...activeChat, messages: updatedHistory }
      : { id: chatHistory.length + 1, messages: updatedHistory };

    setChatHistory((prev) =>
      activeChat
        ? prev.map((chat) =>
            chat.id === activeChat.id ? { ...chat, messages: updatedHistory } : chat
          )
        : [...prev, newChat]
    );
    setActiveChat(newChat);
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

      const updatedChat = { ...newChat, messages: [...updatedHistory, aiMessage] };
      setChatHistory((prev) =>
        prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
      );
      setActiveChat(updatedChat);
    } catch (error) {
      const errorMsg = { type: "error", text: "Something went wrong, try again!" };
      setActiveChat({
        ...newChat,
        messages: [...updatedHistory, errorMsg],
      });
    }

    setGeneratingAnswer(false);
  }


  const handleScroll = () => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      setScrolling(scrollTop + clientHeight < scrollHeight);
    }
  };

  
  function resetChat() {
    setActiveChat(null);
    setQuestion("");
    setHasAsked(false);
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for Chat History */}
      <div className={`bg-gray-200 w-1/4 p-4 flex flex-col ${scrolling ? "bg-blue-100" : ""}`}>
        <button
          className="flex items-center text-blue-500 mb-4 hover:text-blue-700"
          onClick={resetChat}
        >
          <FaPlusCircle className="mr-2" />
          Start New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`p-2 mb-2 rounded cursor-pointer ${
                activeChat?.id === chat.id ? "bg-blue-200" : "bg-white"
              }`}
              onClick={() => setActiveChat(chat)}
            >
              Chat {chat.id}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-white flex-1 flex flex-col">
        <header className={`p-6 text-center transition-all ${hasAsked ? "heading-small" : "heading-large"}`}>
          <h1 className="text-3xl font-bold text-blue-600">ChatAI Bot</h1>
        </header>

        {/* Chat Window */}
        <div
          className="flex-1 flex flex-col p-6 chat-window-container"
          ref={chatWindowRef}
          onScroll={handleScroll}
        >
          <div className="chat-window flex-1 overflow-y-auto bg-gray-100 p-4 rounded-md">
            {activeChat?.messages.length === 0 && (
              <p className="text-gray-500">Ask something to start the conversation...</p>
            )}
            {activeChat?.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.type === "user" ? "user-message" : "ai-message"
                } my-2`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {generatingAnswer && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
        </div>

        {/* Question Input area and it is being fixed at bottom*/}
        <form onSubmit={generateAnswer} className="question-area fixed bottom-0 left-0 w-full p-4 bg-white shadow-md flex space-x-2">
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
      </div>
    </div>
  );
}

export default App;
