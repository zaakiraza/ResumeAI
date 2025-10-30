# Newsletter Subscription API Documentation

## Endpoints

### 1. Subscribe to Newsletter
`POST /api/newsletter/subscribe`

Subscribe a user to the newsletter mailing list.

#### Request Body
```json
{
  "email": "user@example.com",
  "source": "footer" // optional: "footer", "popup", "checkout", "profile", "other"
}
```

#### Success Response
**Status Code:** `201 Created` (new subscriber) or `200 OK` (resubscribed)

```json
{
  "status": true,
  "message": "Successfully subscribed to our newsletter!",
  "data": {
    "subscriber": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isSubscribed": true,
      "source": "footer",
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

#### Error Responses

**Missing Email**
```json
{
  "status": false,
  "message": "Email is required"
}
```

**Invalid Email**
```json
{
  "status": false,
  "message": "Please provide a valid email address"
}
```

**Already Subscribed**
```json
{
  "status": false,
  "message": "This email is already subscribed"
}
```

---

### 2. Unsubscribe from Newsletter
`POST /api/newsletter/unsubscribe`

Unsubscribe a user from the newsletter mailing list.

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Success Response
**Status Code:** `200 OK`

```json
{
  "status": true,
  "message": "You have been unsubscribed from our newsletter",
  "data": null
}
```

#### Error Responses

**Email Not Found**
```json
{
  "status": false,
  "message": "Email not found in our subscriber list"
}
```

**Already Unsubscribed**
```json
{
  "status": false,
  "message": "This email is already unsubscribed"
}
```

---

### 3. Get Newsletter Statistics (Admin Only)
`GET /api/newsletter/stats`

Get newsletter subscription statistics. Requires admin authentication.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response
**Status Code:** `200 OK`

```json
{
  "status": true,
  "message": "Newsletter statistics fetched successfully",
  "data": {
    "totalSubscribers": 1250,
    "totalUnsubscribed": 50,
    "total": 1300,
    "recentSignups": 45,
    "bySource": [
      { "_id": "footer", "count": 800 },
      { "_id": "popup", "count": 300 },
      { "_id": "checkout", "count": 150 }
    ]
  }
}
```

---

## Features

### Email Validation
- Checks for valid email format using regex
- Prevents duplicate subscriptions
- Case-insensitive email storage (converted to lowercase)

### Resubscription
- If a user previously unsubscribed, they can resubscribe
- Resets `unsubscribedAt` field and sets `isSubscribed` to true

### Welcome Email
- Automatically sends a welcome email upon successful subscription
- Email includes:
  - Thank you message
  - What subscribers will receive
  - Unsubscribe information
- If email fails, subscription still succeeds (error is logged)

### Metadata Tracking
- IP address
- User agent
- Referrer URL
- Source (where subscription came from)

### Database Schema
```javascript
{
  email: String (unique, required, lowercase),
  isSubscribed: Boolean (default: true),
  source: String (enum: "footer", "popup", "checkout", "profile", "other"),
  unsubscribedAt: Date (null by default),
  meta: {
    ip: String,
    userAgent: String,
    referrer: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration

### Footer Component
The newsletter subscription form is integrated in the Footer component:

```javascript
const response = await fetch(buildApiUrl(API_ENDPOINTS.NEWSLETTER_SUBSCRIBE), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    source: "footer",
  }),
});
```

### User Experience
- Email validation on client side
- Loading state while subscribing
- Toast notifications for success/error
- Form resets on success
- Disabled input during submission

---

## Environment Variables

Required for email functionality:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

---

## Testing

### Using curl (Windows)
```bash
# Subscribe
curl -X POST "http://localhost:5003/api/newsletter/subscribe" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"source\":\"footer\"}"

# Unsubscribe
curl -X POST "http://localhost:5003/api/newsletter/unsubscribe" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\"}"

# Get stats (requires admin token)
curl -X GET "http://localhost:5003/api/newsletter/stats" -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Using the Frontend
1. Scroll to the footer on any page
2. Enter your email in the "Stay Updated" section
3. Click "Subscribe"
4. Check for success toast notification
5. Check your email inbox for welcome message

---

## Best Practices

### For Admins
- Regularly check newsletter stats
- Monitor unsubscribe rate
- Send newsletters to active subscribers only (isSubscribed: true)
- Honor unsubscribe requests immediately

### For Developers
- Always validate email format
- Handle duplicate subscriptions gracefully
- Log email sending failures
- Don't fail the request if email sending fails
- Store metadata for analytics
- Respect user privacy (GDPR compliance)

---

## Future Enhancements

- [ ] Double opt-in email confirmation
- [ ] Subscription preferences (weekly, monthly)
- [ ] Newsletter categories/topics
- [ ] Bulk email sending functionality
- [ ] Unsubscribe link in emails
- [ ] A/B testing for signup sources
- [ ] Integration with email marketing platforms (Mailchimp, SendGrid)
