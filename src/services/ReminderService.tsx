// services/ReminderService.tsx
import RNFS from 'react-native-fs';
import moment from 'moment';

// Define Reminder interface
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: Date;
  isRecurring: boolean;
  repeatPattern?: string;
  createdAt: Date;
  createdBy: 'voice' | 'manual';
  completed: boolean;
}

/**
 * Process voice input to extract reminder information
 * @param text - Voice recognition text
 * @returns Reminder object or null if not a reminder
 */
export const processReminderFromSpeech = (text: string): Reminder | null => {
  // Convert to lowercase for easier pattern matching
  const lowerText = text.toLowerCase();

  // Check if it's a reminder command
  const isReminder =
    lowerText.includes('remind me') ||
    lowerText.includes('set a reminder') ||
    lowerText.includes('create a reminder') ||
    lowerText.includes('add a reminder');

  if (!isReminder) {
    return null;
  }

  // Extract title and time from the text
  let title = '';
  let dateTime = new Date();
  let isRecurring = false;
  let repeatPattern = '';

  // Extract title based on common phrases
  if (lowerText.includes('remind me to ')) {
    title = text.split('remind me to ')[1];
  } else if (lowerText.includes('set a reminder to ')) {
    title = text.split('set a reminder to ')[1];
  } else if (lowerText.includes('create a reminder to ')) {
    title = text.split('create a reminder to ')[1];
  } else if (lowerText.includes('add a reminder to ')) {
    title = text.split('add a reminder to ')[1];
  } else {
    // If no specific pattern found, use the whole text
    title = text;
  }

  // Extract date and time information
  if (title.includes(' at ')) {
    const parts = title.split(' at ');
    title = parts[0];

    // Parse the time part
    const timeStr = parts[1];
    dateTime = parseTimeString(timeStr, dateTime);
  }

  if (title.includes(' on ')) {
    const parts = title.split(' on ');
    title = parts[0];

    // Parse the date part
    const dateStr = parts[1];
    dateTime = parseDateString(dateStr, dateTime);
  }

  // Check for tomorrow keyword
  if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateTime.setDate(tomorrow.getDate());
    dateTime.setMonth(tomorrow.getMonth());
    dateTime.setFullYear(tomorrow.getFullYear());

    // Remove 'tomorrow' from the title if it exists
    title = title.replace('tomorrow', '').trim();
  }

  // Check for recurring pattern
  if (lowerText.includes('every day') || lowerText.includes('daily')) {
    isRecurring = true;
    repeatPattern = 'daily';

    // Remove pattern words from title
    title = title.replace(/every day|daily/i, '').trim();
  } else if (lowerText.includes('every week') || lowerText.includes('weekly')) {
    isRecurring = true;
    repeatPattern = 'weekly';

    // Remove pattern words from title
    title = title.replace(/every week|weekly/i, '').trim();
  } else if (lowerText.includes('every month') || lowerText.includes('monthly')) {
    isRecurring = true;
    repeatPattern = 'monthly';

    // Remove pattern words from title
    title = title.replace(/every month|monthly/i, '').trim();
  }

  // Clean up title (remove trailing punctuation)
  title = title.replace(/[.,;:]$/, '').trim();

  // Create reminder object
  const reminder: Reminder = {
    id: Date.now().toString(),
    title,
    dateTime,
    isRecurring,
    repeatPattern: isRecurring ? repeatPattern : undefined,
    createdAt: new Date(),
    createdBy: 'voice',
    completed: false,
  };

  return reminder;
};

/**
 * Parse time string and update the dateTime object
 */
const parseTimeString = (timeStr: string, dateTime: Date): Date => {
  const result = new Date(dateTime);

  // Try to parse time formats like "3pm", "15:30", "3:30pm", etc.
  const timeRegex = /(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i;
  const match = timeStr.match(timeRegex);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3] ? match[3].toLowerCase() : null;

    // Handle 12-hour format
    if (period === 'pm' && hour < 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    result.setHours(hour, minutes, 0, 0);
  }

  return result;
};

/**
 * Parse date string and update the dateTime object
 */
const parseDateString = (dateStr: string, dateTime: Date): Date => {
  const result = new Date(dateTime);

  // Handle common date patterns like "January 1", "1st of January", etc.
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  // Look for month name in the string
  const monthIndex = months.findIndex(month => dateStr.toLowerCase().includes(month));
  if (monthIndex !== -1) {
    // Extract day number
    const dayMatch = dateStr.match(/\b(\d{1,2})(st|nd|rd|th)?\b/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1], 10);
      result.setDate(day);
      result.setMonth(monthIndex);
    }
  } else {
    // Check for relative dates like "next monday", "this friday", etc.
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = daysOfWeek.findIndex(day => dateStr.toLowerCase().includes(day));

    if (dayIndex !== -1) {
      const today = result.getDay(); // 0 = Sunday, 1 = Monday, etc.
      let daysToAdd = (dayIndex - today + 7) % 7;

      // If it's "next" day, add 7 more days
      if (dateStr.toLowerCase().includes('next')) {
        daysToAdd += 7;
      }

      // If it's the same day and we didn't specify "next", use today's date
      if (daysToAdd === 0 && !dateStr.toLowerCase().includes('next')) {
        daysToAdd = 0;
      }

      result.setDate(result.getDate() + daysToAdd);
    }
  }

  return result;
};

/**
 * Save reminders to file
 */
export const saveReminders = async (reminders: Reminder[]): Promise<void> => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/reminders.json`;
    await RNFS.writeFile(path, JSON.stringify(reminders), 'utf8');
  } catch (error) {
    console.error('Error saving reminders:', error);
    throw error;
  }
};

/**
 * Load reminders from file
 */
export const loadReminders = async (): Promise<Reminder[]> => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/reminders.json`;
    const exists = await RNFS.exists(path);

    if (exists) {
      const content = await RNFS.readFile(path, 'utf8');
      const data = JSON.parse(content);
      // Convert string dates back to Date objects
      return data.map(
        (
          reminder: Omit<Reminder, 'dateTime' | 'createdAt'> & {
            dateTime: string;
            createdAt: string;
          },
        ) => ({
          ...reminder,
          dateTime: new Date(reminder.dateTime),
          createdAt: new Date(reminder.createdAt),
        }),
      );
    }
    return [];
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

/**
 * Generate human-friendly response for reminder creation
 */
export const generateReminderResponse = (reminder: Reminder): string => {
  const timeStr = moment(reminder.dateTime).format('h:mm A');
  const dateStr = moment(reminder.dateTime).format('dddd, MMMM D');

  let response = `I've set a reminder for you to ${reminder.title} at ${timeStr} on ${dateStr}`;

  if (reminder.isRecurring) {
    response += `, repeating ${reminder.repeatPattern}`;
  }

  // Add some variety to responses
  const variations = [
    "I'll make sure you don't forget!",
    'Consider it done!',
    "I'll remind you when it's time.",
    "I've got that noted for you.",
    "All set! I'll remind you.",
  ];

  const randomVariation = variations[Math.floor(Math.random() * variations.length)];
  response += `. ${randomVariation}`;

  return response;
};
