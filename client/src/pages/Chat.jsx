import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // GET CURRENT USER ID
  // =========================
  const getUserId = () => {
    if (!token) return null;

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.userId;
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getUserId();

  // =========================
  // LOAD CONVERSATION + MESSAGES
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadChat = async () => {
      try {
        // -------------------------
        // GET CONVERSATIONS
        // -------------------------
        const conversationResponse = await fetch(
          '${import.meta.env.VITE_API_URL}/api/chat/conversations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const conversationData =
          await conversationResponse.json();

        console.log(
          "CONVERSATIONS:",
          conversationData
        );

        if (conversationData.success) {
          const currentConversation =
            conversationData.conversations.find(
              (item) =>
                item._id === conversationId
            );

          if (currentConversation) {
            setConversation(
              currentConversation
            );
          } else {
            console.error(
              "Conversation not found"
            );
          }
        }

        // -------------------------
        // GET MESSAGES
        // -------------------------
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("CHAT DATA:", data);

        if (!response.ok || !data.success) {
          alert(
            data.message ||
              "Failed to load chat"
          );

          navigate("/");
          return;
        }

        setMessages(data.messages || []);

        // -------------------------
        // JOIN SOCKET ROOM
        // -------------------------
        socket.emit(
          "join-room",
          conversationId
        );

        console.log(
          "Joined chat room:",
          conversationId
        );
      } catch (error) {
        console.error(
          "CHAT LOAD ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    return () => {
      socket.emit(
        "leave-room",
        conversationId
      );
    };
  }, [conversationId, token, navigate]);

  // =========================
  // RECEIVE REAL-TIME MESSAGE
  // =========================
  useEffect(() => {
    const handleReceiveMessage = (
      message
    ) => {
      console.log(
        "NEW MESSAGE:",
        message
      );

      setMessages((prev) => {
        const alreadyExists =
          prev.some(
            (item) =>
              item._id === message._id
          );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, message];
      });
    };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, []);

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const messageText = text.trim();

    if (!messageText || sending) {
      return;
    }

    if (!conversation) {
      alert("Conversation not loaded");
      return;
    }

    setSending(true);

    try {
      // -------------------------
      // FIND RECEIVER
      // -------------------------
      const buyerId =
        conversation.buyer?._id ||
        conversation.buyer;

      const sellerId =
        conversation.seller?._id ||
        conversation.seller;

      const receiverId =
        buyerId === currentUserId
          ? sellerId
          : buyerId;

      // -------------------------
      // SEND MESSAGE TO SERVER
      // -------------------------
      const response = await fetch(
        '${import.meta.env.VITE_API_URL}/api/chat/message',
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            conversationId,
            receiverId,
            text: messageText,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "SEND MESSAGE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Failed to send message"
        );

        return;
      }

      // -------------------------
      // CLEAR INPUT
      // -------------------------
      setText("");

      // -------------------------
      // SOCKET BROADCAST
      // -------------------------
      socket.emit(
        "send-message",
        {
          ...data.message,
          roomId: conversationId,
        }
      );
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      alert(
        "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="chat-page">
        <div className="chat-loading">
          Loading chat...
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <main className="chat-page">

      <div className="chat-container">

        {/* =========================
            CHAT HEADER
        ========================== */}
        <div className="chat-header">

          <button
            className="chat-back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            ←
          </button>

          <div>
            <h2>
              💬 Chat
            </h2>

            <p>
              {conversation?.ad?.title ||
                "10X BEEZ Ad"}
            </p>
          </div>

        </div>

        {/* =========================
            MESSAGES
        ========================== */}
        <div className="chat-messages">

          {messages.length === 0 ? (
            <div className="empty-chat">

              <span>
                💬
              </span>

              <h3>
                No messages yet
              </h3>

              <p>
                Start the conversation.
              </p>

            </div>
          ) : (
            messages.map(
              (message) => {

                const senderId =
                  message.sender?._id ||
                  message.sender;

                const isMine =
                  senderId ===
                  currentUserId;

                return (
                  <div
                    key={message._id}
                    className={
                      isMine
                        ? "message-row mine"
                        : "message-row"
                    }
                  >

                    <div className="message-bubble">

                      <p>
                        {message.text}
                      </p>

                      <span>
                        {new Date(
                          message.createdAt
                        ).toLocaleTimeString(
                          "en-IN",
                          {
                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          }
                        )}
                      </span>

                    </div>

                  </div>
                );
              }
            )
          )}

        </div>

        {/* =========================
            MESSAGE INPUT
        ========================== */}
        <form
          className="chat-input-area"
          onSubmit={
            handleSendMessage
          }
        >

          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={
              sending ||
              !text.trim()
            }
          >
            {sending
              ? "..."
              : "➤"}
          </button>

        </form>

      </div>

    </main>
  );
}

export default Chat;