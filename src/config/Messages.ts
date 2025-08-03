// src/constants/messages.ts

export const Messages = {
  ARTICLE: {
    CREATE_SUCCESS: 'Article created successfully',
    CREATE_FAILED: 'Failed to create article',
    UPDATE_SUCCESS: 'Article updated successfully',
    UPDATE_FAILED: 'Failed to update article',
    DELETE_SUCCESS: 'Article deleted',
    DELETE_FAILED: 'Failed to delete article',
    NOT_FOUND: 'Article not found',
    LIKE_SUCCESS: 'Article liked successfully',
    LIKE_FAILED: 'Failed to like article',
    DISLIKE_SUCCESS: 'Article disliked successfully',
    DISLIKE_FAILED: 'Failed to dislike article',
    BLOCK_SUCCESS: 'Article blocked/unblocked',
    BLOCK_FAILED: 'Failed to block article',
    FETCH_SUCCESS: 'Articles fetched successfully',
    FETCH_FAILED: 'Failed to fetch user articles',
  },

  AUTH: {
    SIGNUP_SUCCESS: 'Signup successful',
    SIGNUP_FAILED: 'Signup failed',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGIN_FAILED: 'Login failed',
    LOGOUT_SUCCESS: 'Logged out successfully',
    USER_FETCH_SUCCESS: 'User fetched successfully',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    EMAIL_ALREADY_EXISTS: 'User already exists',
    PASSWORD_REQUIRED: 'Password and confirmation are required',
    PASSWORD_MISMATCH: 'Passwords do not match',
    UNAUTHORIZED: 'Unauthorized',
    ACCESS_TOKEN_INVALID: 'Invalid token payload',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token payload',
    TOKENS_MISSING: 'Access and refresh tokens missing',
    AUTH_FAILED: 'Authentication failed',
  },
USER: {
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_UPDATED: 'Password updated successfully',
    PREFERENCES_UPDATED: 'Preferences updated successfully',
  },
  INTERNAL: {
    SERVER_ERROR: 'Internal Server Error',
    DB_CONNECTION_FAILED: 'Failed to connect to MongoDB',
  },
};
