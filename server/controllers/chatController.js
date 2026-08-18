const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Ad = require("../models/Ad");

// =========================
// CREATE OR GET CONVERSATION
// =========================
const createConversation = async (req, res) => {
  try {
    const { adId, sellerId } = req.body;

    const buyerId = req.userId;

    if (!adId || !sellerId) {
      return res.status(400).json({
        success: false,
        message: "Ad ID and Seller ID are required",
      });
    }

    // Buyer cannot chat with himself
    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    // Check ad exists
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Make sure seller is actually the owner of the ad
    if (ad.user.toString() !== sellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller for this ad",
      });
    }

    // Check existing conversation
    let conversation = await Conversation.findOne({
      ad: adId,
      buyer: buyerId,
      seller: sellerId,
    })
      .populate("ad", "title price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    // Create new conversation
    if (!conversation) {
      conversation = await Conversation.create({
        ad: adId,
        buyer: buyerId,
        seller: sellerId,
      });

      conversation = await Conversation.findById(
        conversation._id
      )
        .populate("ad", "title price images")
        .populate("buyer", "name email")
        .populate("seller", "name email");
    }

    res.status(200).json({
      success: true,
      message: "Conversation ready",
      conversation,
    });
  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

// =========================
// GET MESSAGES
// =========================
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const userId = req.userId.toString();

    // Check user belongs to conversation
    if (
      conversation.buyer.toString() !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

// =========================
// SEND MESSAGE
// =========================
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      receiverId,
      text,
    } = req.body;

    const senderId = req.userId;

    if (
      !conversationId ||
      !receiverId ||
      !text?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversation, receiver and message are required",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const userId = senderId.toString();

    // Check sender belongs to conversation
    if (
      conversation.buyer.toString() !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    // Check receiver belongs to conversation
    const receiverIsValid =
      conversation.buyer.toString() ===
        receiverId.toString() ||
      conversation.seller.toString() ===
        receiverId.toString();

    if (!receiverIsValid) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver is not part of this conversation",
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
    });

    // Update last message
    conversation.lastMessage = text.trim();

    await conversation.save();

    const populatedMessage =
      await Message.findById(message._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// =========================
// GET MY CONVERSATIONS
// =========================
const getMyConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations =
      await Conversation.find({
        $or: [
          { buyer: userId },
          { seller: userId },
        ],
      })
        .populate("ad", "title price images")
        .populate("buyer", "name email")
        .populate("seller", "name email")
        .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get conversations",
      error: error.message,
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  createConversation,
  getMessages,
  sendMessage,
  getMyConversations,
};