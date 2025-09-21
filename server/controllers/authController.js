const { auth } = require('../config/firebase');

// Register user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login placeholder
exports.loginUser = async (req, res) => {
  res.status(200).json({ success: true, message: 'Login handled on frontend' });
};
