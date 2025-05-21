import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6">Echobot</h1>
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;