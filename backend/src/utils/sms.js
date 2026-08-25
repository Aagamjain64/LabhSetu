async function sendOtpSms(mobile, otp) {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key) {
    return { delivered: false, reason: 'not_configured' };
  }

  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('authorization', key);
  url.searchParams.set('route', 'otp');
  url.searchParams.set('variables_values', otp);
  url.searchParams.set('flash', '0');
  url.searchParams.set('numbers', mobile);

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    throw new Error('SMS gateway failed');
  }
  return { delivered: true };
}

module.exports = { sendOtpSms };
