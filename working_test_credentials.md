
# WORKING TEST CREDENTIALS FOR RENDER BACKEND
# Backend URL: https://scn-esg-backend.onrender.com
# Generated: 2025-09-30 05:37:56

## Use these credentials for testing your frontend:


### Test User 1:
- Email: admin@scn.com
- Password: Admin123!

### Test User 2:
- Email: business@scn.com
- Password: Business123!

### Test User 3:
- Email: test@scn.com
- Password: Test1234!


## Frontend Environment Variables:
```
VITE_API_URL=https://scn-esg-backend.onrender.com
VITE_BACKEND_URL=https://scn-esg-backend.onrender.com
```

## Frontend API Service Configuration:
```typescript
const API_BASE_URL = 'https://scn-esg-backend.onrender.com';
const LOGIN_ENDPOINT = '/api/v1/users/auth/login/';
```

## Sample Frontend Login Code:
```typescript
const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch('https://scn-esg-backend.onrender.com/api/v1/users/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```
