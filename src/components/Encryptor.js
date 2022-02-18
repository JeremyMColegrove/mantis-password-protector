const { app } = window.require('@electron/remote')

const fs = window.require('fs')
const crypto = window.require('crypto')

const algorithm = 'AES-256-CBC';
let ENCRYPTION_KEY = null ; // or generate sample key Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;

const path = app.getPath('appData') + "/passwords.json.enc"

class CryptoMachine {

    load(key) {
        try {
            ENCRYPTION_KEY = key
            let text = fs.readFileSync(path, 'utf8')
            let json = JSON.parse(this.decrypt(text))
            return json
        } catch(err) {
            return null
        }
        
    }

    save(data, key) {
        ENCRYPTION_KEY = key
        fs.writeFileSync(path, this.encrypt(JSON.stringify(data)))
        return true
    }

    fileExists() {
        return new Promise((resolve, reject)=>{
            fs.exists(path, resolve)
        })
    }

    encrypt(text) {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(algorithm, Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(algorithm, Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }   
}

export default CryptoMachine