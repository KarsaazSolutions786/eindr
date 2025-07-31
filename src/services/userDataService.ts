import { reminderApi, ledgerApi, sttApi, noteApi } from './api';

// Types for user data
export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: 'reminder' | 'ledger' | 'note' | 'other';
  amount?: number;
  date?: string;
  description?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'reminder' | 'ledger' | 'note' | 'voice_command';
  description?: string;
}

export interface LedgerTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'owe' | 'owed';
  friend_name?: string;
  date?: string;
  status?: string;
}

export interface UserDataSummary {
  reminders: ReminderItem[];
  activities: ActivityItem[];
  history: HistoryItem[];
  ledgerTransactions: LedgerTransaction[];
  stats: {
    totalReminders: number;
    completedReminders: number;
    totalLedgerAmount: number;
    recentActivities: number;
    totalNotes: number;
    totalFriends: number;
  };
}

/**
 * Service for fetching user's profile-related data
 */
export class UserDataService {
  /**
   * Fetch user's reminders
   */
  static async getUserReminders(limit: number = 10): Promise<ReminderItem[]> {
    try {
      const response = await reminderApi.get('/reminders', {
        params: { limit, status: 'active' }
      });
      return response.data.reminders || [];
    } catch (error) {
      console.error('Error fetching user reminders:', error);
      return [];
    }
  }

  /**
   * Fetch user's ledger activities
   */
  static async getUserLedgerActivities(limit: number = 5): Promise<ActivityItem[]> {
    try {
      const response = await ledgerApi.get('/transactions', {
        params: { limit, type: 'recent' }
      });
      
      // Transform ledger data to activity format
      const transactions = response.data.transactions || [];
      return transactions.map((transaction: any) => ({
        id: transaction.id.toString(),
        title: transaction.description || `${transaction.type} - ${transaction.amount}`,
        type: 'ledger' as const,
        amount: transaction.amount,
        date: transaction.created_at,
        description: transaction.description
      }));
    } catch (error) {
      console.error('Error fetching ledger activities:', error);
      return [];
    }
  }

  /**
   * Fetch user's history/activity log
   */
  static async getUserHistory(limit: number = 10): Promise<HistoryItem[]> {
    try {
      const response = await sttApi.get('/history', {
        params: { limit, user_id: 'current' }
      });
      
      // Transform history data
      const historyData = response.data.history || [];
      return historyData.map((item: any) => {
        const date = new Date(item.created_at || item.timestamp);
        return {
          id: item.id.toString(),
          title: item.action || item.description || 'Activity',
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: item.type || 'voice_command',
          description: item.details
        };
      });
    } catch (error) {
      console.error('Error fetching user history:', error);
      return [];
    }
  }

  /**
   * Fetch user's ledger summary
   */
  static async getLedgerSummary(): Promise<{ totalOwed: number; totalOwing: number; transactionCount: number }> {
    try {
      const response = await ledgerApi.get('/summary');
      return {
        totalOwed: response.data.total_owed || 0,
        totalOwing: response.data.total_owing || 0,
        transactionCount: response.data.transaction_count || 0
      };
    } catch (error) {
      console.error('Error fetching ledger summary:', error);
      return {
        totalOwed: 0,
        totalOwing: 0,
        transactionCount: 0
      };
    }
  }

  /**
   * Fetch reminder statistics
   */
  static async getReminderStats(): Promise<{ total: number; completed: number; pending: number }> {
    try {
      const response = await reminderApi.get('/reminders/stats');
      return {
        total: response.data.total || 0,
        completed: response.data.completed || 0,
        pending: response.data.pending || 0
      };
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
      return {
        total: 0,
        completed: 0,
        pending: 0
      };
    }
  }

  /**
   * Fetch notes statistics
   */
  static async getNotesStats(): Promise<{ total: number }> {
    try {
      const response = await sttApi.get('/notes/stats');
      return {
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error fetching notes stats:', error);
      return {
        total: 0
      };
    }
  }

  /**
   * Fetch friends statistics
   */
  static async getFriendsStats(): Promise<{ total: number }> {
    try {
      // Import friends service
      const { FriendsService } = require('./friendsService');
      const stats = await FriendsService.getFriendshipStats();
      
      return {
        total: stats.total_friends || 0
      };
    } catch (error) {
      console.error('Error fetching friends stats:', error);
      return {
        total: 0
      };
    }
  }

  /**
   * Fetch comprehensive user data for profile screen
   */
  static async getUserProfileData(): Promise<UserDataSummary> {
    try {
      const [reminders, activities, history, ledgerSummary, reminderStats, notesStats, friendsStats] = await Promise.allSettled([
        this.getUserReminders(12),
        this.getUserLedgerActivities(5),
        this.getUserHistory(10),
        this.getLedgerSummary(),
        this.getReminderStats(),
        this.getNotesStats(),
        this.getFriendsStats()
      ]);

      return {
        reminders: reminders.status === 'fulfilled' ? reminders.value : [],
        activities: activities.status === 'fulfilled' ? activities.value : [],
        history: history.status === 'fulfilled' ? history.value : [],
        ledgerTransactions: [], // Will be populated from activities
        stats: {
          totalReminders: reminderStats.status === 'fulfilled' ? reminderStats.value.total : 0,
          completedReminders: reminderStats.status === 'fulfilled' ? reminderStats.value.completed : 0,
          totalLedgerAmount: ledgerSummary.status === 'fulfilled' ? ledgerSummary.value.totalOwed : 0,
          recentActivities: activities.status === 'fulfilled' ? activities.value.length : 0,
          totalNotes: notesStats.status === 'fulfilled' ? notesStats.value.total : 0,
          totalFriends: friendsStats.status === 'fulfilled' ? friendsStats.value.total : 0
        }
      };
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      throw error;
    }
  }
}