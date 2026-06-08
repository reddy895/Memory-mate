const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const signToken = require('../utils/token');

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user);
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, age, language, address } = req.body;
    const user = await User.create({ name, email, password, role, phone });

    if (role === 'patient') {
      await PatientProfile.create({
        patient: user._id,
        name,
        age,
        language,
        fontSize: req.body.fontSize,
        voiceVolume: req.body.voiceVolume,
        address,
        emergencyContacts: []
      });
    }

    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone
    }
  });
};

module.exports = { login, me, signup };
