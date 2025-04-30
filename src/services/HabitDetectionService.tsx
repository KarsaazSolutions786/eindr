// services/HabitDetectionService.tsx
import moment from 'moment';
import { Reminder } from './ReminderService';

/**
 * Represents a detected habit pattern
 */
export interface HabitPattern {
  title: string;
  normalizedTitle: string;
  suggestedTime: Date;
  confidenceScore: number;
  repeatPattern?: string;
  occurrences: number;
  lastOccurrence: Date;
  dayOfWeek?: number;
  timeOfDay?: string;
}

/**
 * Analyze reminders to detect potential habit patterns
 * @param reminders - List of reminders
 * @returns Potential habit patterns
 */
export const detectHabitPatterns = (reminders: Reminder[]): HabitPattern[] => {
  if (reminders.length < 3) {
    // Need at least 3 reminders to detect patterns
    return [];
  }

  // Step 1: Group similar reminders by normalized title
  const reminderGroups = groupSimilarReminders(reminders);

  // Step 2: Analyze each group for patterns
  const patterns: HabitPattern[] = [];

  for (const [normalizedTitle, group] of Object.entries(reminderGroups)) {
    // Only consider groups with at least 3 reminders
    if (group.length >= 3) {
      const pattern = analyzeReminderGroup(normalizedTitle, group);
      if (pattern) {
        patterns.push(pattern);
      }
    }
  }

  return patterns;
};

/**
 * Get habit suggestions based on detected patterns and current context
 * @param patterns - Detected habit patterns
 * @param existingReminders - Already created reminders
 * @returns Habit suggestions to show to the user
 */
export const getHabitSuggestions = (
  patterns: HabitPattern[],
  existingReminders: Reminder[],
): HabitPattern[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const suggestions: HabitPattern[] = [];

  // Check each pattern to see if it's relevant for today
  patterns.forEach(pattern => {
    // Don't suggest if the confidence is too low
    if (pattern.confidenceScore < 0.6) return;

    // Check if this pattern matches today's day of week (for weekly patterns)
    if (pattern.dayOfWeek !== undefined && pattern.dayOfWeek !== now.getDay()) return;

    // Check if we already have a similar reminder for today
    const similarReminderExists = existingReminders.some(reminder => {
      const reminderDate = new Date(reminder.dateTime);
      const isSameDay =
        reminderDate.getDate() === today.getDate() &&
        reminderDate.getMonth() === today.getMonth() &&
        reminderDate.getFullYear() === today.getFullYear();

      return isSameDay && normalizeTitle(reminder.title) === pattern.normalizedTitle;
    });

    // If no similar reminder exists for today, suggest it
    if (!similarReminderExists) {
      // Create a suggested time for today based on the pattern
      const suggestedTime = new Date(today);
      suggestedTime.setHours(
        pattern.suggestedTime.getHours(),
        pattern.suggestedTime.getMinutes(),
        0,
        0,
      );

      // Only suggest if the time hasn't passed yet
      if (suggestedTime > now) {
        suggestions.push({
          ...pattern,
          suggestedTime,
        });
      }
    }
  });

  // Sort suggestions by time (earliest first)
  return suggestions.sort((a, b) => a.suggestedTime.getTime() - b.suggestedTime.getTime());
};

/**
 * Group similar reminders based on normalized title
 */
const groupSimilarReminders = (reminders: Reminder[]): Record<string, Reminder[]> => {
  const groups: Record<string, Reminder[]> = {};

  reminders.forEach(reminder => {
    const normalizedTitle = normalizeTitle(reminder.title);
    if (!normalizedTitle) return;

    if (!groups[normalizedTitle]) {
      groups[normalizedTitle] = [];
    }

    groups[normalizedTitle].push(reminder);
  });

  return groups;
};

/**
 * Normalize reminder title for comparison
 */
export const normalizeTitle = (title: string): string => {
  if (!title) return '';

  // Convert to lowercase
  let normalized = title.toLowerCase();

  // Remove common stop words
  const stopWords = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'at', 'by', 'with', 'about'];
  stopWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    normalized = normalized.replace(regex, '');
  });

  // Remove punctuation
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
};

/**
 * Analyze a group of similar reminders to detect patterns
 */
const analyzeReminderGroup = (
  normalizedTitle: string,
  reminders: Reminder[],
): HabitPattern | null => {
  // Sort reminders by datetime
  const sortedReminders = [...reminders].sort(
    (a, b) => a.dateTime.getTime() - b.dateTime.getTime(),
  );

  // Analyze time patterns
  const timePattern = analyzeTimePatterns(sortedReminders);

  // Analyze day of week patterns
  const dayOfWeekPattern = analyzeDayOfWeekPatterns(sortedReminders);

  // If the confidence scores are too low, don't consider it a pattern
  if (timePattern.confidence < 0.5 && dayOfWeekPattern.confidence < 0.5) {
    return null;
  }

  // Determine the overall pattern type (daily, weekly, etc.)
  let repeatPattern: string | undefined;
  let dayOfWeek: number | undefined;

  if (dayOfWeekPattern.confidence > 0.7) {
    repeatPattern = 'weekly';
    dayOfWeek = dayOfWeekPattern.dominantDay;
  } else if (timePattern.confidence > 0.7) {
    repeatPattern = 'daily';
  }

  // Get the latest occurrence
  const lastReminder = sortedReminders[sortedReminders.length - 1];

  // Create the habit pattern
  return {
    title: lastReminder.title,
    normalizedTitle,
    suggestedTime: timePattern.suggestedTime,
    confidenceScore: Math.max(timePattern.confidence, dayOfWeekPattern.confidence),
    repeatPattern,
    occurrences: reminders.length,
    lastOccurrence: lastReminder.dateTime,
    dayOfWeek,
    timeOfDay: timePattern.timeOfDay,
  };
};

/**
 * Analyze time patterns in a group of reminders
 */
const analyzeTimePatterns = (reminders: Reminder[]) => {
  // Extract hours and minutes
  const times = reminders.map(reminder => ({
    hour: reminder.dateTime.getHours(),
    minute: reminder.dateTime.getMinutes(),
  }));

  // Group by time of day (morning, afternoon, evening, night)
  const timeGroups = {
    morning: 0, // 5-11
    afternoon: 0, // 12-16
    evening: 0, // 17-21
    night: 0, // 22-4
  };

  times.forEach(time => {
    const { hour } = time;
    if (hour >= 5 && hour < 12) {
      timeGroups.morning += 1;
    } else if (hour >= 12 && hour < 17) {
      timeGroups.afternoon += 1;
    } else if (hour >= 17 && hour < 22) {
      timeGroups.evening += 1;
    } else {
      timeGroups.night += 1;
    }
  });

  // Find the dominant time group
  const sortedGroups = Object.entries(timeGroups).sort((a, b) => b[1] - a[1]);

  const dominantGroup = sortedGroups[0];
  const dominantGroupName = dominantGroup[0];
  const dominantCount = dominantGroup[1];

  // Calculate confidence based on consistency
  const totalReminders = reminders.length;
  const confidence = dominantCount / totalReminders;

  // Calculate average time within dominant group
  let filteredTimes = times;
  switch (dominantGroupName) {
    case 'morning':
      filteredTimes = times.filter(time => time.hour >= 5 && time.hour < 12);
      break;
    case 'afternoon':
      filteredTimes = times.filter(time => time.hour >= 12 && time.hour < 17);
      break;
    case 'evening':
      filteredTimes = times.filter(time => time.hour >= 17 && time.hour < 22);
      break;
    case 'night':
      filteredTimes = times.filter(time => time.hour >= 22 || time.hour < 5);
      break;
  }

  // Calculate average time
  const sumHours = filteredTimes.reduce((sum, time) => sum + time.hour, 0);
  const sumMinutes = filteredTimes.reduce((sum, time) => sum + time.minute, 0);

  const avgHour = Math.round(sumHours / filteredTimes.length);
  const avgMinute = Math.round(sumMinutes / filteredTimes.length);

  // Create suggested time
  const suggestedTime = new Date();
  suggestedTime.setHours(avgHour, avgMinute, 0, 0);

  return {
    confidence,
    timeOfDay: dominantGroupName,
    suggestedTime,
  };
};

/**
 * Analyze day of week patterns
 */
const analyzeDayOfWeekPatterns = (reminders: Reminder[]) => {
  // Extract days of week (0 = Sunday, 1 = Monday, etc.)
  const daysOfWeek = reminders.map(reminder => reminder.dateTime.getDay());

  // Count occurrences of each day
  const dayCounts = Array(7).fill(0);
  daysOfWeek.forEach(day => dayCounts[day]++);

  // Find the dominant day
  let maxCount = 0;
  let dominantDay = 0;

  dayCounts.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count;
      dominantDay = day;
    }
  });

  // Calculate confidence
  const totalReminders = reminders.length;
  const confidence = maxCount / totalReminders;

  return {
    confidence,
    dominantDay,
  };
};

/**
 * Generate a friendly response for habit suggestion
 */
export const generateHabitSuggestionResponse = (pattern: HabitPattern): string => {
  const timeStr = moment(pattern.suggestedTime).format('h:mm A');
  let response = '';

  // Add variety to responses
  const intros = [
    `I've noticed you often ${pattern.title} around this time.`,
    `Based on your habits, you usually ${pattern.title} around now.`,
    `I remember you frequently ${pattern.title} at this time.`,
    `You seem to regularly ${pattern.title} around this hour.`,
  ];

  const questions = [
    `Would you like me to set a reminder for ${timeStr} today?`,
    `Should I add a reminder for ${timeStr}?`,
    `Would you like to do this today at ${timeStr}?`,
    `Want me to remind you at ${timeStr}?`,
  ];

  const randomIntro = intros[Math.floor(Math.random() * intros.length)];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  response = `${randomIntro} ${randomQuestion}`;

  return response;
};
