import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateAd from "./pages/CreateAd";
import AdDetails from "./pages/AdDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAds from "./pages/MyAds";
import EditAd from "./pages/EditAd";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Home - Public */}
        <Route path="/" element={<Home />} />

        {/* Login - Public */}
        <Route path="/login" element={<Login />} />

        {/* Register - Public */}
        <Route path="/register" element={<Register />} />

        {/* Create Ad - Protected */}
        <Route
          path="/create-ad"
          element={
            <ProtectedRoute>
              <CreateAd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ads"
          element={
            <ProtectedRoute>
              <MyAds />
            </ProtectedRoute>
          }
        />


        <Route
          path="/edit-ad/:id"
          element={
            <ProtectedRoute>
              <EditAd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
  path="/chats"
  element={
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  }
/>

        {/* Ad Details - Public */}
        <Route path="/ad/:id" element={<AdDetails />} />

        {/* Chat */}
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;