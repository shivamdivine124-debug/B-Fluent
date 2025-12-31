
import CryptoJS from 'crypto-js';

// Generates a ZegoCloud Token (Version 04)
export function generateToken(appId: number, serverSecret: string, userId: string): string {
    if (!appId || !serverSecret || !userId) {
        console.error("Zego Token Error: Missing required parameters (AppID, Secret, or UserID).");
        return "";
    }

    try {
        // Validation: Check if CryptoJS is loaded correctly
        if (!CryptoJS || !CryptoJS.AES || !CryptoJS.lib) {
            console.error("Zego Token Error: CryptoJS library not loaded correctly.");
            return "";
        }

        const effectiveTimeInSeconds = 3600; // 1 Hour validity
        const createTime = Math.floor(Date.now() / 1000);
        
        // 1. Build Payload
        const payloadObj = {
            app_id: appId,
            user_id: userId,
            nonce: Math.floor(Math.random() * 2147483647),
            ctime: createTime,
            expire: createTime + effectiveTimeInSeconds,
            payload: ''
        };
        
        const payloadJson = JSON.stringify(payloadObj);
        
        // 2. Encryption (AES-128-CBC)
        // 16-byte random IV
        const iv = CryptoJS.lib.WordArray.random(16);
        
        // CRITICAL: Handle Secret Format
        let key;
        if (serverSecret.length === 32) {
            key = CryptoJS.enc.Hex.parse(serverSecret);
        } else {
            key = CryptoJS.enc.Utf8.parse(serverSecret);
        }

        const encrypted = CryptoJS.AES.encrypt(payloadJson, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        const ciphertext = encrypted.ciphertext;
        
        // 3. Pack Binary Data
        // [Expire(8) | IV_Len(2) | IV(16) | Content_Len(2) | Content]
        // Big-Endian Integers
        
        const expire = BigInt(createTime + effectiveTimeInSeconds);
        const bufferSize = 8 + 2 + 16 + 2 + ciphertext.sigBytes;
        const data = new Uint8Array(bufferSize);
        let offset = 0;
        
        const view = new DataView(data.buffer);
        view.setBigInt64(0, expire, false);
        offset += 8;
        
        view.setUint16(offset, 16, false);
        offset += 2;
        
        const ivBytes = new Uint8Array(iv.sigBytes);
        for(let i=0; i<iv.sigBytes; i++) {
            ivBytes[i] = (iv.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        data.set(ivBytes, offset);
        offset += 16;
        
        view.setUint16(offset, ciphertext.sigBytes, false);
        offset += 2;
        
        const contentBytes = new Uint8Array(ciphertext.sigBytes);
        for(let i=0; i<ciphertext.sigBytes; i++) {
            contentBytes[i] = (ciphertext.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        data.set(contentBytes, offset);
        
        // 4. Encode: '04' + Base64
        let binary = '';
        for (let i = 0; i < data.length; i++) {
            binary += String.fromCharCode(data[i]);
        }
        
        console.log("Token Generated Successfully for user:", userId);
        return '04' + btoa(binary);
    } catch (err) {
        console.error("Zego Token Generation CRASH:", err);
        return "";
    }
}
