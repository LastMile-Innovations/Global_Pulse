import crypto from "crypto"
import { logger } from "./logger"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

function getKey(): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    logger.error("ENCRYPTION_KEY is missing or too short. Must be at least 32 characters.")
    throw new Error("Encryption key is not set or too short")
  }
  // Always use the first 32 bytes for AES-256
  return Buffer.from(ENCRYPTION_KEY, "utf-8").slice(0, 32)
}

/**
 * Encrypts sensitive data using AES-256-GCM.
 * @param text The text to encrypt.
 * @returns The encrypted text as a base64 string with IV and auth tag.
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const key = getKey()
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

    let encrypted = cipher.update(text, "utf8", "base64")
    encrypted += cipher.final("base64")
    const authTag = cipher.getAuthTag()

    // Format: base64(iv):base64(authTag):base64(encryptedText)
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
  } catch (error) {
    logger.error("Encryption failed:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypts data that was encrypted with the encrypt function.
 * @param encryptedText The encrypted text (format: base64(iv):base64(authTag):base64(encryptedText))
 * @returns The decrypted text.
 */
export function decrypt(encryptedText: string): string {
  try {
    const [ivBase64, authTagBase64, encryptedData] = encryptedText.split(":")
    if (!ivBase64 || !authTagBase64 || !encryptedData) {
      throw new Error("Invalid encrypted text format")
    }
    const iv = Buffer.from(ivBase64, "base64")
    const authTag = Buffer.from(authTagBase64, "base64")
    const key = getKey()
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedData, "base64", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    logger.error("Decryption failed:", error)
    throw new Error("Failed to decrypt data")
  }
}

/**
 * Utility to check if encryption is available and working.
 * @returns true if encryption is available, false otherwise.
 */
export function isEncryptionAvailable(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

/**
 * Attempts to encrypt and decrypt a test string to verify functionality.
 * @returns true if round-trip succeeds, false otherwise.
 */
export function testEncryptionRoundTrip(): boolean {
  try {
    const testString = "encryption_mvp_test"
    const encrypted = encrypt(testString)
    const decrypted = decrypt(encrypted)
    return decrypted === testString
  } catch (error) {
    logger.error("Encryption round-trip test failed:", error)
    return false
  }
}
