const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: { type: String, required: true, trim: true },
  picture: { type: String },
  password: { type: String }, // For local auth, optional
  countryOfOrigin: { type: String },
  visaType: { type: String },
  interviewDate: { type: Date },
  practiceProfile: {
    destinationCountry: { type: String },
    visaType: { type: String },
    sessionContext: {
      homeCountry: { type: String },
      institutionOrHost: { type: String },
      programOrPurpose: { type: String },
      fundingSource: { type: String },
      returnPlan: { type: String },
      notes: { type: String },
    },
    confidence: {
      before: { type: Number },
    },
    concerns: [{ type: String }],
    feedbackLevel: { type: String },
    updatedAt: { type: Date },
  },
  interviewHistory: [{ // Interview history
    sessionId: { type: String },
    date: { type: Date, default: Date.now },
    country: { type: String },
    visaType: { type: String },
    questions: [{
      question: { type: String },
      answer: { type: String },
      feedback: { type: String },
      feedbackDetails: { type: mongoose.Schema.Types.Mixed },
      feedbackSource: { type: String },
      feedbackStyle: { type: String },
      timeTaken: {type: Number}
    }],
    sessionContext: {
      homeCountry: { type: String },
      institutionOrHost: { type: String },
      programOrPurpose: { type: String },
      fundingSource: { type: String },
      returnPlan: { type: String },
      notes: { type: String },
    },
    confidence: {
      before: { type: Number },
      after: { type: Number },
    },
    concerns: [{ type: String }],
    feedbackLevel: { type: String },
    questionSet: {
      source: { type: String },
      sourceReason: { type: String },
      model: { type: String },
    },
    stats: {
      overallScore: { type: Number },
      strongAreas: [{ type: String }],
      improvementAreas: [{ type: String }],
    },
    timeTakenForInterview: {type: Number},
  }],
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
