import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaRobot, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true); // Speech toggle state
  const messagesEndRef = useRef(null);

  // Scroll to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speak the bot's response
  const speakResponse = (text) => {
    if (isSpeechEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language
      utterance.volume = 1.0; // Volume (0 to 1)
      utterance.rate = 1.0; // Speed (0.1 to 10)
      utterance.pitch = 1.0; // Pitch (0 to 2)
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message with timestamp
    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsBotTyping(true);

    try {
      // Send message to backend
      const response = await fetch('http://172.16.16.143:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();

      // Simulate bot typing delay
      setTimeout(() => {
        const botMessage = {
          text: data.response, // E.g., "Bot: You said 'Hello'"
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
        speakResponse(data.response); // Speak the bot's response
        setIsBotTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Toggle speech on/off
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chatbot Assistant</h2>
        <button
          onClick={toggleSpeech}
          className="p-2 rounded-full hover:bg-indigo-700 transition duration-200"
          title={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
        >
          {isSpeechEnabled ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
          >
            <div className="flex items-end max-w-[70%]">
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                  <FaRobot size={20} />
                </div>
              )}
              <div>
                <div
                  className={`p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user'}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex justify-start">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                <FaRobot size={20} />
              </div>
              <div className="p-3 bg-gray-200 rounded-2xl">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {};

export default ChatWindow;