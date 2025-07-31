# Friend Service Integration

This document describes the integration of the Friend Service backend with the Eindr React Native frontend application.

## Overview

The Friend Service provides comprehensive friend management functionality including:
- Sending and managing friend requests
- Accepting/declining friend requests
- Viewing friends lists and statistics
- Friend request history tracking
- User search and suggestions

## Backend Service

**Live Endpoint:** `https://friend-service-production.up.railway.app`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/friends/requests` | Send a friend request |
| GET | `/friends/` | Get friends list (with optional status filter) |
| PUT | `/friends/requests/{friendship_id}/accept` | Accept a friend request |
| DELETE | `/friends/requests/{friendship_id}` | Decline/remove a friend request |
| GET | `/friends/stats` | Get friendship statistics |
| GET | `/friends/history` | Get friend request history |

### Data Models

#### Friend
```typescript
interface Friend {
  id: string;
  customer_id: string;
  friend_id: string;
  friend_name: string;
  friend_email: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  accepted_at?: string;
}
```

#### FriendRequest
```typescript
interface FriendRequest {
  friend_email: string;
  message?: string;
}
```

#### FriendshipStats
```typescript
interface FriendshipStats {
  total_friends: number;
  pending_requests: number;
  sent_requests: number;
  shared_reminders: number;
  shared_notes: number;
}
```

#### FriendRequestHistoryResponse
```typescript
interface FriendRequestHistoryResponse {
  id: number;
  requester_id: number;
  requested_id: number;
  action: string;
  message?: string;
  created_at: string;
  requester_email?: string;
  requested_email?: string;
}
```

## Frontend Integration

### Configuration

The friend service is configured in the following files:

1. **Environment Variables** (`.env`):
   ```
   FRIEND_SERVICE_URL=https://friend-service-production.up.railway.app
   ```

2. **API Configuration** (`src/services/api.ts`):
   ```typescript
   export const friendApi = createApiInstance(API_ENDPOINTS.FRIEND_SERVICE);
   ```

3. **Service Implementation** (`src/services/friendsService.ts`):
   - All friend-related API calls
   - Error handling with fallback to mock data
   - TypeScript interfaces for type safety

### Available Methods

The `FriendsService` class provides the following methods:

```typescript
// Send a friend request
static async sendFriendRequest(requestData: FriendRequest): Promise<Friend>

// Get friends list with optional status filter
static async getFriends(status?: 'pending' | 'accepted' | 'blocked'): Promise<Friend[]>

// Accept a friend request
static async acceptFriendRequest(friendshipId: string): Promise<{ message: string }>

// Decline a friend request or remove a friend
static async declineFriendRequest(friendshipId: string): Promise<{ message: string }>

// Get friendship statistics
static async getFriendshipStats(): Promise<FriendshipStats>

// Get pending friend requests (received)
static async getPendingRequests(): Promise<Friend[]>

// Get accepted friends
static async getAcceptedFriends(): Promise<Friend[]>

// Get friend request history
static async getFriendRequestHistory(): Promise<FriendRequestHistoryResponse[]>

// Search for users by email
static async searchUsers(query: string): Promise<any[]>

// Get all users for friend suggestions
static async getAllUsers(): Promise<any[]>
```

### Usage Examples

#### Sending a Friend Request
```typescript
import { sendFriendRequest } from '@services/friendsService';

const handleSendRequest = async () => {
  try {
    const result = await sendFriendRequest({
      friend_email: 'friend@example.com',
      message: 'Hey! Let\'s be friends'
    });
    console.log('Friend request sent:', result);
  } catch (error) {
    console.error('Failed to send friend request:', error.message);
  }
};
```

#### Getting Friends List
```typescript
import { getFriends, getAcceptedFriends, getPendingRequests } from '@services/friendsService';

// Get all friends
const allFriends = await getFriends();

// Get only accepted friends
const acceptedFriends = await getAcceptedFriends();

// Get pending requests
const pendingRequests = await getPendingRequests();
```

#### Managing Friend Requests
```typescript
import { acceptFriendRequest, declineFriendRequest } from '@services/friendsService';

// Accept a friend request
const handleAccept = async (friendshipId: string) => {
  try {
    const result = await acceptFriendRequest(friendshipId);
    console.log(result.message); // "Friend request accepted"
  } catch (error) {
    console.error('Failed to accept request:', error.message);
  }
};

// Decline a friend request
const handleDecline = async (friendshipId: string) => {
  try {
    const result = await declineFriendRequest(friendshipId);
    console.log(result.message); // "Friend request declined"
  } catch (error) {
    console.error('Failed to decline request:', error.message);
  }
};
```

#### Getting Statistics
```typescript
import { getFriendshipStats } from '@services/friendsService';

const loadStats = async () => {
  const stats = await getFriendshipStats();
  console.log(`You have ${stats.total_friends} friends`);
  console.log(`${stats.pending_requests} pending requests`);
  console.log(`${stats.sent_requests} sent requests`);
};
```

## Authentication

All friend service endpoints require authentication. The API automatically includes the JWT token from the Redux store in the Authorization header:

```typescript
Authorization: Bearer <jwt_token>
```

The token is automatically refreshed when it expires, ensuring seamless user experience.

## Error Handling

The service includes comprehensive error handling:

1. **Network Errors**: Graceful fallback to mock data for development
2. **Authentication Errors**: Automatic token refresh
3. **Validation Errors**: Clear error messages from the backend
4. **Server Errors**: Proper error propagation with user-friendly messages

## Testing

A test file is available at `src/tests/friendServiceIntegration.test.ts` for manual testing of the integration:

```typescript
import { testFriendServiceIntegration } from '@tests/friendServiceIntegration.test';

// Run the integration test
testFriendServiceIntegration();
```

## UI Integration

The friend service is integrated with the following UI components:

- **FriendsScreen** (`src/screens/FriendsScreen.tsx`): Main friends management interface
- **MessageContainer** (`src/components/MessageContainer.tsx`): Chat integration
- **HomeScreenMiddleSection** (`src/components/HomeScreenMiddleSection.tsx`): Quick access to friends

## Development Notes

1. **Mock Data**: The service includes comprehensive mock data for development when the backend is unavailable
2. **Type Safety**: All interfaces are properly typed with TypeScript
3. **Logging**: Comprehensive logging for debugging and monitoring
4. **Fallback Handling**: Graceful degradation when services are unavailable

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for real-time friend request notifications
2. **Friend Permissions**: Integration with the friend permissions system
3. **Social Features**: Enhanced social features like mutual friends, friend suggestions
4. **Offline Support**: Caching and offline synchronization

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure the user is logged in and has a valid token
2. **Network Errors**: Check internet connectivity and service availability
3. **Validation Errors**: Verify email format and required fields

### Debug Mode

Enable debug logging by setting `DEBUG_MODE=true` in the `.env` file to see detailed API request/response logs.