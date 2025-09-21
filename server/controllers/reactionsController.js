const admin = require('firebase-admin');
const db = admin.firestore(); // Firebase Firestore instance

// Add a reaction
const addReaction = async (req, res) => {
  try {
    const { postId, type } = req.body;

    if (!postId || !type) {
      return res.status(400).json({ error: 'Post ID and reaction type are required' });
    }

    const reactionData = {
      postId,
      type,
      userId: req.user.uid,
      createdAt: new Date()
    };

    await db.collection('reactions').add(reactionData);

    res.status(201).json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
};

// Remove a reaction
const removeReaction = async (req, res) => {
  try {
    const { reactionId } = req.params;

    const reactionRef = db.collection('reactions').doc(reactionId);
    const reactionDoc = await reactionRef.get();

    if (!reactionDoc.exists) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    // Ensure the current user owns this reaction
    if (reactionDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this reaction' });
    }

    await reactionRef.delete();

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
};

module.exports = {
  addReaction,
  removeReaction
};
