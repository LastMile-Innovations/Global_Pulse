import { PostgrestError } from "@supabase/supabase-js";

/**
 * Error codes that can be returned from Supabase/PostgREST
 */
export const SUPABASE_ERROR_CODES = {
  // PostgreSQL error codes
  UNDEFINED_TABLE: "42P01", // undefined_table
  UNDEFINED_COLUMN: "42703", // undefined_column
  
  // PostgREST error codes
  PGRST_NO_RELATIONSHIP: "PGRST116", // No relationship found between tables
  PGRST_RESOURCE_NOT_FOUND: "PGRST204", // Resource not found
};

/**
 * Checks if the error is related to missing database tables
 */
export function isTableNotFoundError(error: PostgrestError | null): boolean {
  if (!error) return false;
  
  return (
    error.code === SUPABASE_ERROR_CODES.UNDEFINED_TABLE ||
    (typeof error.message === 'string' && error.message.includes("relation") && error.message.includes("does not exist"))
  );
}

/**
 * Checks if the error is related to missing database columns
 */
export function isColumnNotFoundError(error: PostgrestError | null): boolean {
  if (!error) return false;
  
  return (
    error.code === SUPABASE_ERROR_CODES.UNDEFINED_COLUMN ||
    (typeof error.message === 'string' && error.message.includes("column") && error.message.includes("does not exist"))
  );
}

/**
 * Safely executes a Supabase query with proper error handling for missing tables
 * @param queryFn - Function that performs the Supabase query
 * @param fallbackData - Data to return if the table doesn't exist
 * @param errorHandler - Optional custom error handler
 */
export async function safeQueryExecution<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }> | any,
  fallbackData: T | null = null,
  errorHandler?: (error: PostgrestError) => void
): Promise<{ data: T | null; error: PostgrestError | null; tableNotFound: boolean }> {
  try {
    // Handle both direct promises and Supabase query builder
    const result = await queryFn();
    const { data, error } = result;
    
    if (error) {
      if (isTableNotFoundError(error)) {
        console.warn(`Database table not found: ${error.message}`);
        return { data: fallbackData, error: null, tableNotFound: true };
      }
      
      // Handle other errors
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error("Database query error:", error);
      }
      
      return { data: null, error, tableNotFound: false };
    }
    
    return { data, error: null, tableNotFound: false };
  } catch (err) {
    const error = err as PostgrestError;
    console.error("Unexpected database error:", error);
    return { data: null, error, tableNotFound: false };
  }
}
