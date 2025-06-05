import { StyleSheet, Platform } from 'react-native';

const isIos = Platform.OS === 'ios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#14162D',
  },
  contentContainer: {
    flex: 1,
    marginTop: isIos ? 90 : 120,
  },
  userHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userDetailsContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '400',
    color: 'white',
    marginBottom: 4,
  },
  accountDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  downloadHeaderButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  downloadHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  downloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  downloadText: {
    color: 'white',
    fontSize: 14,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: '45%',
  },
  dateButtonText: {
    color: 'white',
    fontSize: 14,
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionLeft: {
    justifyContent: 'center',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: isIos ? 60 : 90,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#4CAF50',
  },
  summaryValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default styles;
