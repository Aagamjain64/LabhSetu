function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Please check the information you entered.', details: err.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({
      message: field === 'email'
        ? 'An account with this email already exists.'
        : field === 'mobile'
          ? 'An account with this mobile number already exists.'
          : 'This information is already registered.',
    });
  }
  const status = Number(err.status) || 500;
  return res.status(status).json({
    message: status === 500 ? 'Something went wrong. Please try again.' : err.message,
  });
}

module.exports = { errorHandler };
