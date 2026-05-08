const axios = require('axios');
const Contribution = require('../models/Contribution');
const Chama = require('../models/Chama');

// Get Access Token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

// Make Contribution via M-Pesa STK Push
const makeContribution = async (req, res) => {
  try {
    const token = await getAccessToken();
    const { phone, amount, chamaId } = req.body;

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'ChamaContribution',
        TransactionDesc: 'Chama Contribution'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save contribution to database
    const contribution = new Contribution({
      member: req.user.userId,
      chama: chamaId,
      amount,
      phone,
      status: 'pending',
      merchantRequestID: response.data.MerchantRequestID,
      checkoutRequestID: response.data.CheckoutRequestID,
    });
    await contribution.save();

    res.json({
      message: 'Payment request sent! Check your phone for PIN prompt.',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle M-Pesa Callback
const contributionCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    const resultCode = callbackData.Body.stkCallback.ResultCode;
    const checkoutRequestID = callbackData.Body.stkCallback.CheckoutRequestID;

    const status = resultCode === 0 ? 'completed' : 'failed';
    const contribution = await Contribution.findOneAndUpdate(
      { checkoutRequestID },
      { status },
      { new: true }
    );

    // Update chama balance if payment successful
    if (status === 'completed' && contribution) {
      await Chama.findByIdAndUpdate(
        contribution.chama,
        { $inc: { totalBalance: contribution.amount } }
      );
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Contributions for a Chama
const getChamaContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ chama: req.params.chamaId })
      .populate('member', 'name phone')
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get My Contributions
const getMyContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.user.userId })
      .populate('chama', 'name')
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  makeContribution,
  contributionCallback,
  getChamaContributions,
  getMyContributions
};