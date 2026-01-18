import 'server-only'
import crypto from 'crypto'

// Use a consistent key for the application. 
// In production, this MUST be in environment variables.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-prod-32' // Must be 32 chars
const IV_LENGTH = 16 // For AES, this is always 16

export function encrypt(text: string): string {
    // Check key length
    if (ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters')
    }

    // Normalize key to 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)

    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
    // Check key length
    if (ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters')
    }

    // Normalize key to 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)

    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
}
