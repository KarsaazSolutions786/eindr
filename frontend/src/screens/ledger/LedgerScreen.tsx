import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import theme from '@theme/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import Sidebar from '../../components/common/Sidebar';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import styles from './styles/LedgerScreenStyles';

// Define types for our transaction data
interface Transaction {
  id: number;
  name: string;
  type: 'receive' | 'pay';
  amount: number;
  status: string;
}

interface LedgerSummary {
  accountPayable: number;
  accountReceivable: number;
  subTotal: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LedgerScreen = () => {
  const [activeTab, setActiveTab] = useState('balance');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    accountPayable: 0,
    accountReceivable: 0,
    subTotal: 0,
  });
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // This would be replaced with an API call to fetch real data
    fetchLedgerData();
  }, []);

  // Calculate summary dynamically based on transaction data
  useEffect(() => {
    calculateSummary(transactions);
  }, [transactions]);

  // Function to calculate summary from transaction data
  const calculateSummary = (transactions: Transaction[]) => {
    const accountPayable = transactions
      .filter(t => t.type === 'pay')
      .reduce((sum, t) => sum + t.amount, 0);

    const accountReceivable = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.amount, 0);

    const subTotal = accountReceivable - accountPayable;

    setSummary({
      accountPayable,
      accountReceivable,
      subTotal,
    });
  };

  // Mock function to simulate API call
  const fetchLedgerData = () => {
    // This is placeholder data that would be replaced with actual API response
    const mockTransactions: Transaction[] = [
      { id: 1, name: 'Hassan', type: 'receive', amount: 80000, status: "Owe's you" },
      { id: 2, name: 'Yasir', type: 'pay', amount: 80000, status: 'You Owe' },
      { id: 3, name: 'Waseem', type: 'receive', amount: 10000, status: "Owe's you" },
      { id: 4, name: 'Arsalan', type: 'pay', amount: 40000, status: 'You Owe' },
      { id: 5, name: 'Arbab', type: 'receive', amount: 8000, status: "Owe's you" },
    ];

    // Update state with mock data - summary will be calculated by the useEffect
    setTransactions(mockTransactions);
  };

  const renderTransactionItem = (item: Transaction) => {
    const isReceive = item.type === 'receive';
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.transactionItem}
        onPress={() => {
          navigation.navigate('UserTransactions', {
            userName: item.name,
            accountType: isReceive ? 'Account Receivable' : 'Account Payable',
          });
        }}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionName}>{item.name}</Text>
          <Text style={[styles.transactionStatus, isReceive ? styles.receiveText : styles.payText]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, isReceive ? styles.receiveText : styles.payText]}>
            PKR {item.amount.toLocaleString()}
          </Text>
          <TouchableOpacity
            style={styles.reminderButton}
            onPress={e => {
              e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
              console.log('Set reminder for:', item.id);
            }}>
            <Text style={styles.reminderText}>Set Reminder &gt;</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    if (activeTab === 'receivable') {
      return transactions.filter(item => item.type === 'receive');
    } else if (activeTab === 'payable') {
      return transactions.filter(item => item.type === 'pay');
    }
    return transactions;
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ledger" onMenuPress={toggleSidebar} onProfilePress={() => {}} />

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balance' && styles.activeTabContainer]}
          onPress={() => setActiveTab('balance')}>
          {activeTab === 'balance' ? (
            <LinearGradient
              colors={['#BB7BEC', '#672BBB']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientBackground}>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Net</Text>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Balance</Text>
            </LinearGradient>
          ) : (
            <>
              <Text style={styles.tabTitle}>Net</Text>
              <Text style={styles.tabTitle}>Balance</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'receivable' && styles.activeTabContainer]}
          onPress={() => setActiveTab('receivable')}>
          {activeTab === 'receivable' ? (
            <LinearGradient
              colors={['#9EA1F8', '#555BE9']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientBackground}>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Account</Text>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Receivable</Text>
            </LinearGradient>
          ) : (
            <>
              <Text style={styles.tabTitle}>Account</Text>
              <Text style={styles.tabTitle}>Receivable</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'payable' && styles.activeTabContainer]}
          onPress={() => setActiveTab('payable')}>
          {activeTab === 'payable' ? (
            <LinearGradient
              colors={['#78A6FF', '#3267CC']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Account</Text>
              <Text style={[styles.tabTitle, styles.activeTabText]}>Payable</Text>
            </LinearGradient>
          ) : (
            <>
              <Text style={styles.tabTitle}>Account</Text>
              <Text style={styles.tabTitle}>Payable</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.transactionContainer}>
        {getFilteredTransactions().map(item => renderTransactionItem(item))}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Account payable</Text>
          <Text style={styles.summaryValue}>PKR {summary.accountPayable.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Account receivable</Text>
          <Text style={styles.summaryValue}>PKR {summary.accountReceivable.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Sub Total</Text>
          <Text style={styles.totalValue}>PKR {summary.subTotal.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

export default LedgerScreen;
