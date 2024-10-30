/* eslint-disable unicorn/prefer-node-protocol */

const Buffer = require('buffer').Buffer;

function parseJwt(token?: string) {
  if (token) {
    const base64Url = token.split('.')[1];
    if (base64Url) {
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      const decodedData = JSON.parse(
        Buffer.from(base64, 'base64').toString('binary'),
      );
      return decodedData;
    } else {
      return;
    }
  }
  return;
}

export { parseJwt };
