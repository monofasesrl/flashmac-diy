// WordPress auth types
export interface WordPressAuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role?: string;  // Make role optional since it might not always be present
  };
}

export interface AuthError {
  message: string;
}
