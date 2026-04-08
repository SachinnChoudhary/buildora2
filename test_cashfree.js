const https = require('https');

const data = JSON.stringify({
  customer_details: {
    customer_id: "test1234",
    customer_phone: "9999999999"
  },
  order_meta: {
    return_url: "http://localhost:3000/return?order_id={order_id}"
  },
  order_amount: 1,
  order_currency: "INR",
});

const req = https.request('https://sandbox.cashfree.com/pg/orders', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': 'TEST_DUMMY_ID',
    'x-client-secret': 'TEST_DUMMY_SECRET'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.on('error', console.error);
req.write(data);
req.end();
