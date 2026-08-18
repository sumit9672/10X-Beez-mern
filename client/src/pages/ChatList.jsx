import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/chat/conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("MY CONVERSATIONS:", data);

        if (!response.ok || !data.success) {
          setError(
            data.message || "Failed to load conversations"
          );
          return;
        }

        setConversations(data.conversations || []);
      } catch (error) {
        console.error(
          "CONVERSATIONS ERROR:",
          error
        );

        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, navigate]);

  if (loading) {
    return (
      <main className="chat-list-page">
        <div className="chat-list-container">
          <div className="chat-list-loading">
            Loading messages...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-list-page">
      <div className="chat-list-container">

        {/* Header */}
        <div className="chat-list-header">
          <div>
            <h1>💬 Messages</h1>
            <p>
              Your buyer & seller conversations
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* No Chats */}
        {!error && conversations.length === 0 && (
          <div className="empty-chat-list">
            <div className="empty-chat-icon">
              💬
            </div>

            <h2>No conversations yet</h2>

            <p>
              Open an ad and start chatting with
              the seller.
            </p>

            <button
              onClick={() => navigate("/")}
              className="browse-btn"
            >
              Browse Ads
            </button>
          </div>
        )}

        {/* Conversations */}
        {conversations.length > 0 && (
          <div className="conversation-list">

            {conversations.map((conversation) => {
              const ad = conversation.ad;

              const currentUserId = (() => {
                try {
                  const payload = JSON.parse(
                    atob(token.split(".")[1])
                  );

                  return payload.userId;
                } catch {
                  return null;
                }
              })();

              const isBuyer =
                conversation.buyer?._id ===
                currentUserId;

              const otherUser = isBuyer
                ? conversation.seller
                : conversation.buyer;

              return (
                <div
                  key={conversation._id}
                  className="conversation-card"
                  onClick={() =>
                    navigate(
                      `/chat/${conversation._id}`
                    )
                  }
                >

                  {/* Ad Image */}
                  <div className="conversation-image">
                    {ad?.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000${ad.images[0]}`}
                        alt={ad.title}
                      />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  {/* Chat Information */}
                  <div className="conversation-info">

                    <h3>
                      {ad?.title ||
                        "10X BEEZ Ad"}
                    </h3>

                    <p className="conversation-user">
                      👤{" "}
                      {otherUser?.name ||
                        "10X BEEZ User"}
                    </p>

                    <p className="last-message">
                      {conversation.lastMessage
                        ? conversation.lastMessage
                        : "Start conversation..."}
                    </p>

                  </div>

                  {/* Arrow */}
                  <div className="conversation-arrow">
                    →
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

export default ChatList;