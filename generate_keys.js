const { generateKeyPairSync } = require('crypto');
const { writeFile } = require('fs/promises');
const { stdout } = require('process');

const result = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

(async () => {
    await Promise.all([
        writeFile('./private_key', result.privateKey),
        writeFile('./public_key', result.publicKey)
    ]);
    stdout.write('Finished creating keys');
})();