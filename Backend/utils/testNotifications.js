// Debug script to test notification creation
// This can be used to manually test if notifications are being created correctly

import mongoose from 'mongoose';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const testNotificationCreation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Find a test user (get any user)
    const testUser = await User.findOne().limit(1);
    if (!testUser) {
      console.log('No users found in database');
      return;
    }

    console.log('Test user found:', testUser.email);

    // Create a test notification
    const testNotification = await Notification.createSystemNotification(
      testUser._id,
      'Test Notification 🧪',
      'This is a test notification to verify the notification system is working correctly.',
      {
        type: 'info',
        category: 'system',
        priority: 'medium',
        actionUrl: '/dashboard',
        actionText: 'Go to Dashboard',
        metadata: {
          isTest: true,
          timestamp: new Date(),
        }
      }
    );

    console.log('Test notification created:', testNotification);

    // Check if notification was created
    const notifications = await Notification.find({ userId: testUser._id }).sort({ createdAt: -1 });
    console.log(`Total notifications for user: ${notifications.length}`);
    console.log('Latest notifications:', notifications.slice(0, 3));

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(testUser._id);
    console.log(`Unread notifications: ${unreadCount}`);

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testNotificationCreation();