import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '@theme/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import Sidebar from '../../components/common/Sidebar';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { logout } from '@store/slices/authSlice';
import { logoutUser as logoutUserAPI } from '@services/authService';
import { logoutUser } from '@services/authInitService';
import { AppDispatch } from '@store/index';
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
  const dispatch = useDispatch<AppDispatch>();
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
    // Fetch real data from the ledger service API
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

  // Function to fetch ledger data from API
  const fetchLedgerData = async () => {
    try {
      // Import the ledger API
      const { ledgerApi } = await import('@services/api');
      
      // Fetch transactions from the API
      const response = await ledgerApi.get('/entries');
      
      // Transform API response to match our Transaction interface
      const apiTransactions = response.data || [];
      const transformedTransactions: Transaction[] = apiTransactions.map((entry: any) => ({
        id: entry.id,
        name: entry.friend_name || `Friend ${entry.friend_id}`,
        type: entry.ledger_direction_id === 1 ? 'receive' : 'pay', // Assuming 1 = receive, 2 = pay
        amount: parseFloat(entry.amount),
        status: entry.ledger_direction_id === 1 ? "Owe's you" : 'You Owe'
      }));
      
      // Update state with real data - summary will be calculated by the useEffect
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      // Set empty transactions on error
      setTransactions([]);
    }
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

  // Handle logout
  const handleLogout = async () => {
    try {
      // Use performLogout from authAudit which handles refresh token properly
      const { performLogout } = await import('../../utils/authAudit');
      await performLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ledger" onMenuPress={toggleSidebar} onProfilePress={() => {}} />

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} onLogout={handleLogout} />

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
