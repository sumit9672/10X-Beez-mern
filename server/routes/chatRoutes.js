const express = require("express");

const {
  createConversation,
  getMessages,
  sendMessage,
  getMyConversations,
} = require("../controllers/chatController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create / Get Conversation
router.post(
  "/conversation",
  protect,
  createConversation
);

// Get My Conversations
router.get(
  "/conversations",
  protect,
  getMyConversations
);

// Get Messages
router.get(
  "/messages/:conversationId",
  protect,
  getMessages
);

// Send Message
router.post(
  "/message",
  protect,
  sendMessage
);

module.exports = router;