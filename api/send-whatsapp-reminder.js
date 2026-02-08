const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, medicine, time } = req.body;

  if (!phoneNumber || !medicine || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+91${phoneNumber}`,
      body: `💊 *DigiHosp Medicine Reminder*

⏰ Time: ${time}
💊 Medicine: ${medicine}

Please take your medicine on time!

_Stay healthy! 🌟_
- Team DigiHosp`,
    });

    console.log('WhatsApp sent:', message.sid);

    res.status(200).json({
      success: true,
      messageId: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({
      error: error.message || 'Failed to send WhatsApp message',
    });
  }
};