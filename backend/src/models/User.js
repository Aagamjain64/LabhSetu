const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    mobileVerifiedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['citizen', 'moderator', 'state_admin', 'central_admin', 'admin'],
      default: 'citizen',
      index: true,
    },
    // Only meaningful when role === 'state_admin'. One of India's 28 states
    // or 8 union territories — scopes that admin's scheme & user access.
    // central_admin has no assignedState — it manages schemes across every
    // state (the "central" catalogue), while state_admin is locked to just
    // their own state's schemes.
    assignedState: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email || '',
    mobile: this.mobile,
    role: this.role || 'citizen',
    assignedState: this.assignedState || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
