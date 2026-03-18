import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import twilio from 'twilio';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone: phone || null }] 
    });
    
    if (userExists) {
      const field = userExists.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} already registered` });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
    };
    if (phone) userData.phone = phone;
    
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken, mockEmail, mockName } = req.body;
    let googleId, email, name, picture;

    // Handle Mock Token for Development
    if (idToken === 'mock_google_token') {
       googleId = 'mock_google_' + Date.now();
       email = mockEmail || 'demo.google@civicfix.com';
       name = mockName || 'Google Auth User';
       picture = 'https://ui-avatars.com/api/?name=Google+User&background=3b82f6&color=fff';
    } else {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          password: 'google_mock_password_123', // Satisfy schema
          avatar: picture,
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const otpStore = new Map();

// Mobile OTP Service using Twilio Verify or In-Memory Mock
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const isDevMock = !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_sid' || process.env.NODE_ENV === 'development';

    if (isDevMock) {
      // Real-time generated Mock OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(phone, { otp: generatedOtp, expires: Date.now() + 5 * 60 * 1000 }); // 5 minutes expiry
      console.log(`[REALTIME MOCK OTP] Sent to ${phone}: ${generatedOtp}`);
      return res.json({ message: 'OTP sent successfully (Mock Mode)', status: 'pending', mock: true, otp: generatedOtp });
      // Note: We're sending 'otp' in the response ONLY for testing reasons. In a real application, NEVER do this!
    }

    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' });

    res.json({ message: 'OTP sent successfully', status: verification.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const isDevMock = !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_sid' || process.env.NODE_ENV === 'development';
    
    let isApproved = false;

    if (isDevMock) {
      const storedData = otpStore.get(phone);
      if (storedData && storedData.otp === otp && storedData.expires > Date.now()) {
        isApproved = true;
        otpStore.delete(phone); // Burn after use
      } else {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }
    } else {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code: otp });
      isApproved = verificationCheck.status === 'approved';
    }

    if (isApproved) {
      let user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          name: `User ${phone.slice(-4)}`,
          phone,
          email: `${phone.replace('+', '')}@civicfix.com`, // Satisfy schema
          password: 'otp_user_pass' // Satisfy schema
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
