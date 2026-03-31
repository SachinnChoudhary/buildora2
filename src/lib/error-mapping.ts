/**
 * Translates technical Firebase error codes into user-friendly messages.
 * Prevents technical jargon from being displayed to the end-user.
 */
export function mapFirebaseError(error: any): string {
  const code = error?.code || error?.message || '';

  const errorMessages: Record<string, string> = {
    // Auth Errors
    'auth/invalid-credential': 'Invalid email or password. Please check your details and try again.',
    'auth/user-not-found': 'No account exists with this email address.',
    'auth/wrong-password': 'The password you entered is incorrect.',
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/weak-password': 'Your password is too weak. Please use at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user': 'The sign-in popup was closed before completion.',
    
    // Firestore Errors
    'permission-denied': 'You do not have permission to perform this action.',
    'resource-exhausted': 'Server busy. Please try again later.',
    'not-found': 'The requested item was not found.',
    'unavailable': 'Our servers are temporarily unavailable. Please try again in a moment.',
  };

  // Check for substring matches if exact key is not found
  for (const [key, message] of Object.entries(errorMessages)) {
    if (code.includes(key)) {
      return message;
    }
  }

  // Fallback for unknown errors
  return 'Something went wrong. Please try again.';
}
