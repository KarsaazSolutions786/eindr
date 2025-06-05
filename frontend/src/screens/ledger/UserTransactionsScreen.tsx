import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenHeader from '../../components/common/ScreenHeader';
import CalendarModal from '../../screens/dashboard/components/CalendarModal';
import { DateData } from 'react-native-calendars';
import styles from './styles/UserTransactionsScreenStyles';

type UserTransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'UserTransactions'>;

interface Transaction {
  id: number;
  date: string;
  time: string;
  amount: number;
  type: 'receive' | 'pay';
}

type MarkedDates = {
  [date: string]: {
    selected: boolean;
    selectedColor: string;
  };
};

const UserTransactionsScreen: React.FC<UserTransactionsScreenProps> = ({ route, navigation }) => {
  const { userName, accountType } = route.params || {
    userName: 'Muhammad Waseem',
    accountType: 'Account Receivable',
  };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Calendar states
  const [startDateCalendarVisible, setStartDateCalendarVisible] = useState(false);
  const [endDateCalendarVisible, setEndDateCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startDateMarked, setStartDateMarked] = useState<MarkedDates>({});
  const [endDateMarked, setEndDateMarked] = useState<MarkedDates>({});

  // Fetch transactions for the user
  useEffect(() => {
    fetchUserTransactions();
  }, []);

  const fetchUserTransactions = () => {
    // This would be an API call in a real app
    const mockTransactions: Transaction[] = [
      { id: 1, date: '30th Feb', time: '04:20 pm', amount: 80000, type: 'receive' },
      { id: 2, date: '30th Feb', time: '04:20 pm', amount: 10000, type: 'pay' },
      { id: 3, date: '30th Feb', time: '04:20 pm', amount: 80000, type: 'receive' },
      { id: 4, date: '30th Feb', time: '04:20 pm', amount: 10000, type: 'pay' },
      { id: 5, date: '30th Feb', time: '04:20 pm', amount: 80000, type: 'receive' },
      { id: 6, date: '30th Feb', time: '04:20 pm', amount: 10000, type: 'pay' },
      { id: 7, date: '30th Feb', time: '04:20 pm', amount: 80000, type: 'receive' },
    ];

    setTransactions(mockTransactions);

    // Calculate total
    const total = mockTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'receive') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, 0);

    setTotalAmount(total);
  };

  const handleDownload = async () => {
    try {
      setIsGeneratingReport(true);

      // Generate text report
      const reportContent = generatePlainTextReport(
        userName,
        transactions,
        totalAmount,
        accountType,
      );

      // Share the report
      await Share.share({
        title: `${userName} Transaction Report`,
        message: reportContent,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate the transaction report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generatePlainTextReport = (
    userName: string,
    transactions: Transaction[],
    totalAmount: number,
    accountType: string,
  ): string => {
    // Calculate totals
    const totalDebit = transactions
      .filter(t => t.type === 'pay')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredit = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.amount, 0);

    // Format date range
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Generate report header
    let report = `EINDR TRANSACTION REPORT\n`;
    report += `=======================\n\n`;
    report += `User: ${userName}\n`;
    report += `Date: ${formattedDate}\n\n`;

    // Add summary
    report += `SUMMARY\n`;
    report += `=======================\n`;
    report += `Total Debit: PKR ${totalDebit.toLocaleString()}\n`;
    report += `Total Credit: PKR ${totalCredit.toLocaleString()}\n`;
    report += `Net Balance: PKR ${totalAmount.toLocaleString()}\n\n`;

    // Add transaction details
    report += `TRANSACTION DETAILS\n`;
    report += `=======================\n`;

    transactions.forEach((transaction, index) => {
      const type = transaction.type === 'receive' ? 'Credit' : 'Debit';
      report += `${index + 1}. ${
        transaction.date
      } | ${type} | PKR ${transaction.amount.toLocaleString()}\n`;
    });

    return report;
  };

  const handleSetReminder = (transactionId: number) => {
    // Implement set reminder functionality
    console.log('Setting reminder for transaction', transactionId);
  };

  // Calendar handlers
  const handleStartDatePress = () => {
    setStartDateCalendarVisible(true);
  };

  const handleEndDatePress = () => {
    setEndDateCalendarVisible(true);
  };

  const handleStartDayPress = (day: DateData) => {
    const dateString = day.dateString;

    // Format for display
    const formattedDate = formatDate(dateString);
    setStartDate(formattedDate);

    // Update marked dates
    const newMarkedDates: MarkedDates = {
      [dateString]: {
        selected: true,
        selectedColor: '#2176FF',
      },
    };
    setStartDateMarked(newMarkedDates);

    // Close calendar
    setStartDateCalendarVisible(false);

    // TODO: Filter transactions by date range
    console.log('Start date selected:', dateString);
  };

  const handleEndDayPress = (day: DateData) => {
    const dateString = day.dateString;

    // Format for display
    const formattedDate = formatDate(dateString);
    setEndDate(formattedDate);

    // Update marked dates
    const newMarkedDates: MarkedDates = {
      [dateString]: {
        selected: true,
        selectedColor: '#2176FF',
      },
    };
    setEndDateMarked(newMarkedDates);

    // Close calendar
    setEndDateCalendarVisible(false);

    // TODO: Filter transactions by date range
    console.log('End date selected:', dateString);
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const renderTransactionItem = (transaction: Transaction) => {
    const isReceive = transaction.type === 'receive';

    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionName}>{userName}</Text>
          <Text style={[styles.transactionStatus, isReceive ? styles.receiveText : styles.payText]}>
            {isReceive ? "Owe's you" : 'You Owe'}
          </Text>
          <Text style={styles.transactionDate}>
            {transaction.date} {transaction.time}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, isReceive ? styles.receiveText : styles.payText]}>
            PKR {transaction.amount.toLocaleString()}
          </Text>
          <TouchableOpacity
            style={styles.reminderButton}
            onPress={() => handleSetReminder(transaction.id)}>
            <Text style={styles.reminderText}>Set Reminder &gt;</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Custom action button for the header
  const DownloadButton = () => (
    <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
      <Text style={styles.downloadText}>Download</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Use the enhanced ScreenHeader component */}
      <ScreenHeader
        title={'Ledger Details'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        {/* User header section */}
        <View style={styles.userHeaderContainer}>
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.accountDetails}>
              {accountType} {totalAmount.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.downloadHeaderButton}
            onPress={handleDownload}
            disabled={isGeneratingReport}>
            {isGeneratingReport ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.downloadHeaderText}>Download</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Filter Section */}
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={handleStartDatePress}>
            <Text style={styles.dateButtonText}>{startDate ? startDate : 'Start date'}</Text>
            <MaterialIcons name="calendar-today" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={handleEndDatePress}>
            <Text style={styles.dateButtonText}>{endDate ? endDate : 'End date'}</Text>
            <MaterialIcons name="calendar-today" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <ScrollView style={styles.transactionsContainer}>
          {transactions.map(transaction => renderTransactionItem(transaction))}
        </ScrollView>

        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{accountType}</Text>
            <Text style={styles.summaryValue}>PKR {totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Calendar Modals */}
      <CalendarModal
        visible={startDateCalendarVisible}
        selectedDates={startDateMarked}
        onDayPress={handleStartDayPress}
        onClose={() => setStartDateCalendarVisible(false)}
      />

      <CalendarModal
        visible={endDateCalendarVisible}
        selectedDates={endDateMarked}
        onDayPress={handleEndDayPress}
        onClose={() => setEndDateCalendarVisible(false)}
      />
    </SafeAreaView>
  );
};

export default UserTransactionsScreen;
