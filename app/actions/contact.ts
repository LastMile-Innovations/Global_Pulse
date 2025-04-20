"use server"

import { headers } from "next/headers"
import { db } from "@/lib/db"
import { contactMessages, contactCategoryEnum } from "@/lib/db/schema/contactMessages"
import { contactFormSchema, type ContactFormValues } from "@/lib/validations/contact"
import { revalidatePath } from "next/cache"
import { logger } from "@/lib/utils/logger"
import { unstable_cache } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { eq } from "drizzle-orm"

/**
 * Gets the currently authenticated Supabase user ID
 * @returns Promise<string | null> The Supabase user ID or null if not authenticated.
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch (error) {
    logger.error(`Error fetching user ID: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Server action to handle contact form submission
 * Uses Drizzle ORM with proper validation and error handling
 */
export async function submitContactForm(
  formData: ContactFormValues
): Promise<{ success: boolean; error?: string }> {
  // --- Rate Limiting ---
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || "unknown";
  const userId = await getUserId();
  const { rateLimit } = await import("@/lib/redis/rate-limit");
  const logger = (await import("@/lib/utils/logger")).logger;
  const limitResult = await rateLimit(
    { userId, ip: ipAddress, path: "action:submitContactForm" },
    {
      limit: 3,
      window: 3600,
      keyPrefix: "action:contact:submit",
      ipFallback: { enabled: true, limit: 2 },
    }
  );
  if (limitResult?.limited) {
    logger.warn(`[RateLimit Exceeded] [submitContactForm] identifierType=${userId ? "userId" : "hashedIp"} identifierValue=${userId || ipAddress} limit=3/3600s`);
    return { success: false, error: "Rate limit exceeded. Please try again later." };
  }
  // --- End Rate Limiting ---

  try {
    // Validate form data with our Zod schema
    const validatedData = contactFormSchema.safeParse(formData)
    
    if (!validatedData.success) {
      return {
        success: false,
        error: "Invalid form data: " + validatedData.error.message,
      }
    }
    
    // Get user session (if logged in)
    // Note: userId is fetched once near the top for rate limiting, re-use it.
    // const userId = await getUserId() // Already fetched above
    
    // Get client IP address for security/spam prevention
    // Note: ipAddress is fetched once near the top for rate limiting, re-use it.
    // const headersList = await headers()
    // const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown" // Fetch userAgent here if needed for logging

    // Construct the data object for insertion, matching the Drizzle schema
    const insertData = {
      userId: userId,
      name: validatedData.data.name,
      email: validatedData.data.email,
      subject: validatedData.data.subject,
      category: validatedData.data.category as typeof contactCategoryEnum.enumValues[number],
      message: validatedData.data.message,
      ipAddress: ipAddress,
    };
    
    // Insert the contact message using Drizzle
    const [newMessage] = await db.insert(contactMessages)
      .values(insertData) 
      .returning({ id: contactMessages.id })
    
    // Log successful submission (but not full message content for privacy)
    logger.info("Contact form submitted", {
      messageId: newMessage.id,
      category: insertData.category, // Use value from insertData
      userId: insertData.userId, // Log userId if available
      ipAddress: insertData.ipAddress, // Log IP address
      userAgent
    })
    
    // Revalidate any admin pages that might show contact messages
    revalidatePath("/admin/contact")
    
    // Clear cache for contact message counts
    await invalidateContactCountCache()
    
    return { success: true }
  } catch (error) {
    // Log error for debugging
    logger.error("Contact form submission error", {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return {
      success: false,
      error: "Failed to submit contact form. Please try again later."
    }
  }
}

/**
 * Function to count unread contact messages
 * Cached with unstable_cache for better performance
 */
export const getUnreadContactCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const result = await db.select({ count: db.$count(contactMessages.id) })
        .from(contactMessages)
        .where(eq(contactMessages.status, "new"))
      
      return Number(result[0]?.count || 0)
    } catch (error) {
      logger.error("Error counting unread messages", { error })
      return 0
    }
  },
  ["unread-contact-count"],
  { tags: ["contact-messages"], revalidate: 300 } // Cache for 5 minutes
)

/**
 * Helper to invalidate the contact count cache
 */
async function invalidateContactCountCache() {
  try {
    // Force revalidation of the unstable_cache
    revalidatePath("/admin/contact")
  } catch (error) {
    logger.error("Failed to invalidate contact cache", { error })
  }
} 