import { StyleSheet, Platform } from 'react-native';

const isIos = Platform.OS === 'ios';

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    // backgroundColor: '#14162D',
  },

  // Tab navigation section
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: isIos ? 70 : 100,
  },
  tab: {
    width: '30%',
    height: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    overflow: 'hidden',
  },
  activeTabContainer: {
    padding: 0, // Remove padding since it will be applied in the gradient
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    // padding: 10,
  },
  activeTab: {
    // Keep this for backward compatibility, but we're not using it now
  },
  tabTitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  activeTabText: {
    fontWeight: '600',
  },

  // Transaction list section
  transactionContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  transactionLeft: {
    justifyContent: 'center',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionName: {
    fontSize: 22,
    fontWeight: '400',
    color: 'white',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 17,
  },
  transactionAmount: {
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 4,
  },

  // Common styles
  receiveText: {
    color: '#4CAF50',
  },
  payText: {
    color: '#F44336',
  },
  reminderButton: {
    paddingVertical: 4,
  },
  reminderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },

  // Summary section
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: isIos ? 50 : 80,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default styles;
