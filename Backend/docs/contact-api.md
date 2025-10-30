# Contact API Documentation

## Endpoint
`POST /api/contact`

## Description
Allows users (authenticated or public) to send contact messages. Messages are saved to the database and forwarded via email to support.

## Authentication
- **Not required** - This is a public endpoint
- If user is logged in, their `userId` will be stored with the message

## Request Body
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "subject": "string (optional)",
  "message": "string (required)"
}
```

## Example Request
```bash
# Using curl (Windows)
curl -X POST "http://localhost:5003/api/contact" -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"subject\":\"General Inquiry\",\"message\":\"I need help with my resume.\"}"

# Using curl (Linux/Mac)
curl -X POST "http://localhost:5003/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "General Inquiry",
    "message": "I need help with my resume."
  }'
```

## Success Response
**Status Code:** `201 Created`

```json
{
  "status": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": null,
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "General Inquiry",
      "message": "I need help with my resume.",
      "meta": {
        "ip": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "referrer": "http://localhost:5173"
      },
      "createdAt": "2025-10-30T10:30:00.000Z",
      "updatedAt": "2025-10-30T10:30:00.000Z"
    }
  }
}
```

## Error Responses

### Missing Required Fields
**Status Code:** `400 Bad Request`

```json
{
  "status": false,
  "message": "Name, email and message are required"
}
```

### Server Error
**Status Code:** `500 Internal Server Error`

```json
{
  "status": false,
  "message": "Failed to send message"
}
```

## Environment Variables
Make sure these are set in your `.env` file:

- `EMAIL_USER` - Gmail address for sending emails (required)
- `EMAIL_PASS` - Gmail app password (required)
- `SUPPORT_EMAIL` - Email address to receive contact messages (optional, defaults to EMAIL_USER)

## Email Notification
When a message is submitted successfully:
1. Message is saved to MongoDB (`ContactMessage` collection)
2. Email is sent to `SUPPORT_EMAIL` (or `EMAIL_USER`) with message details
3. If email fails, the message is still saved (email error is logged)

## Frontend Integration
The Contact page at `/contact` uses this API:

```javascript
const response = await fetch(buildApiUrl(API_ENDPOINTS.CONTACT), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: formData.fullName,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
  }),
});
```

## Database Schema
Messages are stored in the `contactmessages` collection:

```javascript
{
  userId: ObjectId (optional),
  name: String (required),
  email: String (required),
  subject: String (default: "Message from website"),
  message: String (required),
  meta: {
    ip: String,
    userAgent: String,
    referrer: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Testing
1. Start the backend server: `npm start` or `npm run dev`
2. Navigate to the Contact page in the frontend
3. Fill out the form and click "Send Message"
4. Check MongoDB for the saved message
5. Check your support email inbox for the notification
