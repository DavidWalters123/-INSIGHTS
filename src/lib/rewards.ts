import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'react-hot-toast';

// Credit values for different actions
export const REWARD_CREDITS = {
  CREATE_POST: 10,
  RECEIVE_LIKE: 2,
  COMMENT: 5,
  RECEIVE_COMMENT: 3,
  COURSE_COMPLETION: 50,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETE: 20,
  FIRST_COURSE_CREATED: 100,
  COURSE_ENROLLMENT: 15,
  ACHIEVEMENT_UNLOCK: 25,
  COMMUNITY_CREATION: 75,
  RESOURCE_SHARE: 8,
  STREAK_BONUS: 10, // Additional bonus per day of streak
} as const;

// Achievement thresholds
export const ACHIEVEMENT_THRESHOLDS = {
  POSTS: [1, 5, 10, 25, 50, 100],
  COMMENTS: [1, 10, 50, 100, 500],
  LIKES_RECEIVED: [1, 10, 50, 100, 500],
  COURSES_COMPLETED: [1, 5, 10, 25],
  COURSES_CREATED: [1, 5, 10],
  STREAK_DAYS: [7, 30, 90, 180, 365],
} as const;

interface RewardTransaction {
  userId: string;
  type: keyof typeof REWARD_CREDITS;
  credits: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export async function awardCredits(
  userId: string, 
  type: keyof typeof REWARD_CREDITS,
  metadata?: Record<string, any>
) {
  try {
    const credits = REWARD_CREDITS[type];
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Create reward transaction
    const transaction: RewardTransaction = {
      userId,
      type,
      credits,
      timestamp: new Date(),
      metadata
    };

    // Add transaction to history
    await setDoc(doc(db, 'reward_transactions', `${userId}_${Date.now()}`), transaction);

    // Update user's credit balance
    await updateDoc(userRef, {
      'credits.balance': increment(credits),
      'credits.lifetime': increment(credits),
      'credits.last_updated': serverTimestamp(),
      [`credits.${type.toLowerCase()}_count`]: increment(1)
    });

    // Check for achievements
    await checkAchievements(userId);

    // Show success message
    toast.success(`+${credits} credits earned!`);

    return credits;
  } catch (error) {
    console.error('Error awarding credits:', error);
    toast.error('Failed to award credits');
    return 0;
  }
}

async function checkAchievements(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData?.credits) return;

    const newAchievements = [];
    const stats = userData.credits;

    // Check each achievement type
    for (const [category, thresholds] of Object.entries(ACHIEVEMENT_THRESHOLDS)) {
      const count = stats[`${category.toLowerCase()}_count`] || 0;
      const unlockedLevel = userData.achievements?.[category] || 0;
      
      // Find next unlocked level
      const nextLevel = thresholds.findIndex(threshold => 
        count >= threshold && (unlockedLevel < thresholds.indexOf(threshold) + 1)
      );

      if (nextLevel !== -1) {
        newAchievements.push({
          category,
          level: nextLevel + 1,
          threshold: thresholds[nextLevel],
          timestamp: new Date()
        });

        // Award achievement credits
        await awardCredits(userId, 'ACHIEVEMENT_UNLOCK', {
          category,
          level: nextLevel + 1
        });
      }
    }

    // Update user achievements
    if (newAchievements.length > 0) {
      const achievements = { ...userData.achievements };
      newAchievements.forEach(achievement => {
        achievements[achievement.category] = achievement.level;
      });

      await updateDoc(userRef, { achievements });

      // Show achievement notifications
      newAchievements.forEach(achievement => {
        toast.success(`Achievement Unlocked: ${achievement.category} Level ${achievement.level}!`, {
          duration: 5000,
          icon: '🏆'
        });
      });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}