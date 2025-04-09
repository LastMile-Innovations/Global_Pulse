import { PostgrestError } from "@supabase/supabase-js";

/**
 * Common error codes returned from Supabase/PostgREST and PostgreSQL.
 * Refer to PostgreSQL and PostgREST documentation for a complete list.
 * - PostgreSQL Error Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
 * - PostgREST Error Codes: https://postgrest.org/en/stable/errors.html
 */
export const SUPABASE_ERROR_CODES = {
  // PostgreSQL Error Codes (Class 23 — Integrity Constraint Violation)
  NOT_NULL_VIOLATION: "23502", // not_null_violation
  FOREIGN_KEY_VIOLATION: "23503", // foreign_key_violation
  UNIQUE_VIOLATION: "23505", // unique_violation
  CHECK_VIOLATION: "23514", // check_violation

  // PostgreSQL Error Codes (Class 42 — Syntax Error or Access Rule Violation)
  UNDEFINED_TABLE: "42P01", // undefined_table
  UNDEFINED_COLUMN: "42703", // undefined_column
  DUPLICATE_OBJECT: "42710", // duplicate_object (e.g., creating a table that already exists)
  INSUFFICIENT_PRIVILEGE: "42501", // insufficient_privilege (RLS issues often manifest as this)

  // PostgreSQL Error Codes (Class 08 — Connection Exception)
  CONNECTION_DOES_NOT_EXIST: "08003", // connection_does_not_exist
  CONNECTION_FAILURE: "08006", // connection_failure
  SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION: "08001", // sqlclient_unable_to_establish_sqlconnection

  // PostgREST Error Codes
  // Note: PostgREST often wraps PostgreSQL errors, so you might see PG codes more often.
  PGRST_EMPTY_BODY: "PGRST100", // Request body must not be empty
  PGRST_INVALID_RANGE: "PGRST103", // Requested range not satisfiable
  PGRST_INVALID_PREFERENCE: "PGRST105", // Invalid value for Prefer header
  PGRST_NO_RELATIONSHIP: "PGRST116", // No relationship found between tables
  PGRST_UNSUPPORTED_MEDIA: "PGRST109", // Unsupported media type
  PGRST_JSON_STRUCTURE_INVALID: "PGRST200", // Could not parse request body
  PGRST_PERMISSION_DENIED: "PGRST301", // Permission denied (often related to RLS)
  PGRST_TIMEOUT: "PGRST302", // Timeout
  PGRST_RESOURCE_NOT_FOUND: "PGRST204", // Resource not found (can sometimes indicate table/view not found if schema isn't exposed)
};

/** Type alias for better readability */
type MaybePostgrestError = PostgrestError | null | undefined;

/**
 * Checks if the error is related to missing database tables.
 * This primarily checks for the PostgreSQL 'undefined_table' code.
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates an undefined table, false otherwise.
 */
export function isTableNotFoundError(error: MaybePostgrestError): boolean {
  if (!error) return false;
  
  // Primary check using the specific Postgres code
  if (error.code === SUPABASE_ERROR_CODES.UNDEFINED_TABLE) {
    return true;
  }
  
  // Fallback check based on common message patterns (less reliable)
  // PostgREST might sometimes return a different code or message format
  return (
    (typeof error.message === 'string' && 
     error.message.toLowerCase().includes("relation") && 
     error.message.toLowerCase().includes("does not exist"))
  );
}

/**
 * Checks if the error is related to missing database columns.
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates an undefined column, false otherwise.
 */
export function isColumnNotFoundError(error: MaybePostgrestError): boolean {
  if (!error) return false;

  // Primary check using the specific Postgres code
  if (error.code === SUPABASE_ERROR_CODES.UNDEFINED_COLUMN) {
    return true;
  }
  
  // Fallback check based on common message patterns
  return (
    (typeof error.message === 'string' && 
     error.message.toLowerCase().includes("column") && 
     error.message.toLowerCase().includes("does not exist"))
  );
}

/**
 * Checks if the error is related to a constraint violation (unique, foreign key, not null, check).
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates a constraint violation, false otherwise.
 */
export function isConstraintViolationError(error: MaybePostgrestError): boolean {
  if (!error?.code) return false;
  return (
    error.code === SUPABASE_ERROR_CODES.NOT_NULL_VIOLATION ||
    error.code === SUPABASE_ERROR_CODES.FOREIGN_KEY_VIOLATION ||
    error.code === SUPABASE_ERROR_CODES.UNIQUE_VIOLATION ||
    error.code === SUPABASE_ERROR_CODES.CHECK_VIOLATION
  );
}

/**
 * Checks if the error is related to permissions (e.g., RLS).
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates insufficient privileges, false otherwise.
 */
export function isPermissionError(error: MaybePostgrestError): boolean {
  if (!error) return false;
  return (
    error.code === SUPABASE_ERROR_CODES.INSUFFICIENT_PRIVILEGE ||
    error.code === SUPABASE_ERROR_CODES.PGRST_PERMISSION_DENIED
  );
}

/**
 * Checks if the error is related to network or connection issues.
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates a connection problem, false otherwise.
 */
export function isConnectionError(error: MaybePostgrestError): boolean {
  if (!error?.code) return false;
  return (
    error.code === SUPABASE_ERROR_CODES.CONNECTION_DOES_NOT_EXIST ||
    error.code === SUPABASE_ERROR_CODES.CONNECTION_FAILURE ||
    error.code === SUPABASE_ERROR_CODES.SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION
  );
}

/**
 * Checks if the error is related to duplicate objects (e.g., table already exists).
 * @param error - The PostgrestError object or null/undefined.
 * @returns True if the error indicates a duplicate object, false otherwise.
 */
export function isDuplicateError(error: MaybePostgrestError): boolean {
  if (!error) return false;
  return error.code === SUPABASE_ERROR_CODES.DUPLICATE_OBJECT;
}

/**
 * Interface representing the expected structure of a Supabase query result.
 */
interface SupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Options for the safeQueryExecution function.
 */
interface SafeQueryExecutionOptions<T> {
  /** Data to return if the table doesn't exist. Defaults to null. */
  fallbackData?: T | null;
  /** Optional custom error handler for errors other than 'table not found'. */
  errorHandler?: (error: PostgrestError) => void;
  /** Set to true to suppress the console warning when a table is not found. Defaults to false. */
  suppressTableNotFoundWarning?: boolean;
}

/**
 * Result type for the safeQueryExecution function.
 */
interface SafeQueryExecutionResult<T> extends SupabaseQueryResult<T> {
  /** Indicates if the query failed specifically because the table was not found. */
  tableNotFound: boolean;
}

/**
 * Safely executes a Supabase query with proper error handling, especially for missing tables.
 * Catches errors during the query execution and checks for specific Supabase error codes.
 * 
 * @template T The expected type of the data returned by the query.
 * @param queryFn - An async function that performs the Supabase query. It must return a Promise resolving to an object with `data` and `error` properties.
 * @param options - Optional configuration for fallback data and error handling.
 * @returns A Promise resolving to an object containing the data (or fallbackData), error (or null), and a boolean indicating if the table was not found.
 * 
 * @example
 * const { data, error, tableNotFound } = await safeQueryExecution(
 *   () => supabase.from('possibly_missing_table').select('*').single(),
 *   { fallbackData: null } // Optional: provide default data if table is missing
 * );
 * 
 * if (tableNotFound) {
 *   console.log("Table doesn't exist yet, using fallback.");
 * } else if (error) {
 *   console.error("An error occurred:", error.message);
 * } else {
 *   console.log("Data fetched:", data);
 * }
 */
export async function safeQueryExecution<T>(
  queryFn: () => Promise<SupabaseQueryResult<T>>,
  options: SafeQueryExecutionOptions<T> = {}
): Promise<SafeQueryExecutionResult<T>> {
  const { 
    fallbackData = null, 
    errorHandler, 
    suppressTableNotFoundWarning = false 
  } = options;

  if (typeof queryFn !== 'function') {
    console.error("safeQueryExecution error: queryFn must be a function that returns a Promise.");
    // Return a structured error similar to PostgrestError for consistency
    const error: PostgrestError = {
        message: "Invalid queryFn provided to safeQueryExecution",
        details: "queryFn must be a function returning a Promise",
        hint: "",
        code: "INVALID_INPUT",
        name: 'PostgrestError' // Added name property
    }
    return { data: null, error, tableNotFound: false };
  }

  try {
    const result = await queryFn();
    
    // Ensure the result has the expected shape, even if the underlying function's return type wasn't strictly enforced
    const data = result?.data ?? null;
    const error = result?.error ?? null;
    
    if (error) {
      if (isTableNotFoundError(error)) {
        if (!suppressTableNotFoundWarning) {
          console.warn(`Supabase table not found: ${error.message}. Returning fallback data.`);
        }
        return { data: fallbackData, error: null, tableNotFound: true };
      }
      
      // Handle other specific errors or use the generic handler
      if (errorHandler) {
        errorHandler(error);
      } else {
        // Default error logging for non-table-not-found errors
        console.error("Supabase query error:", error);
      }
      
      return { data: null, error, tableNotFound: false };
    }
    
    // Success case
    return { data, error: null, tableNotFound: false };

  } catch (err) {
    // Catch errors thrown *during* the execution of queryFn itself, 
    // or if the queryFn promise rejects unexpectedly.
    console.error("Unexpected error during Supabase query execution:", err);
    
    // Check if it looks like a PostgrestError (duck typing)
    const looksLikePostgrestError = 
      typeof err === 'object' && 
      err !== null &&
      'code' in err && typeof err.code === 'string' &&
      'message' in err && typeof err.message === 'string' &&
      'details' in err && typeof err.details === 'string' &&
      'hint' in err && typeof err.hint === 'string';

    const error: PostgrestError = looksLikePostgrestError 
      ? { ...(err as PostgrestError), name: 'PostgrestError' } 
      : { 
          message: err instanceof Error ? err.message : "An unknown error occurred",
          details: err instanceof Error ? err.stack ?? "No stack available" : "Non-Error object received",
          hint: "Check application logs for the original error structure.", 
          code: "UNEXPECTED_ERROR",
          name: 'PostgrestError' 
        };

    if (errorHandler) {
        errorHandler(error);
    }

    return { data: null, error, tableNotFound: false };
  }
}