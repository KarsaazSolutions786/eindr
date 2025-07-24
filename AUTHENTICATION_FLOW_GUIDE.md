# 🔐 Comprehensive Authentication Flow Guide

## 🌐 System Authentication Architecture

### Overview
The authentication system is a robust, multi-layered security mechanism designed to provide secure, stateless authentication across microservices using JSON Web Tokens (JWT).

## 🚪 Authentication Stages

### 1. User Registration
**Endpoint:** `POST /auth/register`

#### Request Payload
```typescript
interface RegistrationRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  gender: string;
  is_new?: boolean;
}
```

#### Registration Flow
1. Validate input (email format, password strength)
2. Check if email already exists
3. Hash password using bcrypt
4. Create user record
5. Generate JWT tokens

#### Response
```typescript
interface RegistrationResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  customer: {
    id: number;
    email: string;
    profile: {
      is_new: boolean;
    }
  }
}
```

### 2. User Login
**Endpoint:** `POST /auth/login`

#### Request Payload
```typescript
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}
```

#### Login Flow
1. Validate credentials
2. Check account status (active, locked)
3. Verify password hash
4. Generate new JWT tokens
5. Update last login timestamp
6. Reset login attempts

#### Response
- Same structure as registration response
- Includes access and refresh tokens

### 3. Token Structure
```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;
  iat: number;           // Issued at timestamp
  exp: number;           // Expiration timestamp
  permissions: string[]; // User roles/permissions
  type: 'access' | 'refresh';
}
```

### 4. Token Validation Process
```typescript
function validateToken(token: string) {
  try {
    // 1. Decode token
    const payload = jwt.decode(token);

    // 2. Check expiration
    if (Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    // 3. Verify signature
    jwt.verify(token, SECRET_KEY);

    // 4. Check token type
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    // Handle various token validation errors
    handleTokenError(error);
  }
}
```

### 5. Token Refresh
**Endpoint:** `POST /auth/refresh`

#### Request
```typescript
interface RefreshRequest {
  refresh_token: string;
}
```

#### Refresh Flow
1. Validate refresh token
2. Check token against blacklist
3. Generate new access token
4. Optionally issue new refresh token

#### Response
```typescript
interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}
```

### 6. Logout
**Endpoint:** `POST /auth/logout`

#### Logout Process
1. Blacklist current access token
2. Invalidate refresh token
3. Clear server-side session

## 🛡️ Security Mechanisms

### Token Blacklisting
```typescript
class TokenBlacklist {
  // Redis-backed token blacklist
  async blacklistToken(token: string, expiresAt: number) {
    await redisClient.set(
      `blacklist:${token}`, 
      'true', 
      'EX', 
      expiresAt - Date.now()
    );
  }

  async isTokenBlacklisted(token: string) {
    return await redisClient.exists(`blacklist:${token}`);
  }
}
```

### Rate Limiting
```typescript
function applyRateLimiting(request) {
  const { ip, user } = request;
  
  // IP-based rate limiting
  const ipRequestCount = incrementIPRequestCount(ip);
  if (ipRequestCount > MAX_IP_REQUESTS) {
    throw new RateLimitError('Too many requests from IP');
  }

  // User-based rate limiting
  if (user) {
    const userRequestCount = incrementUserRequestCount(user.id);
    if (userRequestCount > MAX_USER_REQUESTS) {
      throw new RateLimitError('Too many requests for user');
    }
  }
}
```

## 🌈 Frontend Integration

### Axios Interceptor Example
```typescript
const axiosInstance = axios.create({
  baseURL: 'https://api.example.com'
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Token expired, attempt refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      try {
        const newTokens = await refreshTokens();
        setAccessToken(newTokens.access_token);
        
        originalRequest.headers['Authorization'] = 
          `Bearer ${newTokens.access_token}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 🚨 Error Handling

### Common Authentication Errors
1. **401 Unauthorized**
   - Invalid credentials
   - Expired token
   - Token not provided

2. **403 Forbidden**
   - Insufficient permissions
   - Account locked

3. **422 Validation Error**
   - Invalid input format
   - Password constraints not met

## 🔍 Debugging Tips
- Use browser network tab
- Implement comprehensive logging
- Handle token storage securely
- Test edge cases

## 🚧 Security Checklist
- [ ] Use HTTPS
- [ ] Implement token rotation
- [ ] Secure token storage
- [ ] Validate all inputs
- [ ] Implement proper error handling
- [ ] Use short-lived access tokens

## 📦 Recommended Tools
- `jsonwebtoken` for token management
- `bcrypt` for password hashing
- `axios` for HTTP requests
- `redis` for token blacklisting

---

**Version**: 1.0.0
**Last Updated**: July 2024
**Security Level**: Enterprise Grade 