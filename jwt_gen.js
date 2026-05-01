const jwt = require('jsonwebtoken');
const secret = 'pixelbloom-gym-secret-key-must-be-at-least-32-chars';

const token = jwt.sign(
  {
    sub: 'admin@test.com',
    role: 'ADMIN',
    memberId: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  },
  secret,
  { algorithm: 'HS256' }
);

console.log(token);
