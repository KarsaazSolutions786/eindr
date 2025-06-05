import { StyleSheet, Dimensions } from 'react-native';
import theme from '@theme/theme';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  dayDateContainer: {
    borderRadius: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    marginBottom: 10,
    marginTop: 120,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  dateText: {
    fontSize: 15,
    color: '#8D8E99',
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: 6,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayScrollContent: {
    paddingBottom: 5,
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginHorizontal: 8,
    width: 45,
    height: 70,
  },
  selectedDayItem: {
    backgroundColor: 'rgba(91, 104, 255, 0.95)',
    borderRadius: 12,
    width: 45,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B68FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayText: {
    fontSize: 13,
    color: '#8D8E99',
    marginBottom: 12,
    fontWeight: '500',
  },
  dateNumber: {
    fontSize: 20,
    color: '#8D8E99',
  },
  selectedDateNumber: {
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  addReminderContainer: {
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 54, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addReminderText: {
    color: theme.colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
  remindersMainContainer: {
    borderRadius: 18,
    padding: 17,
    marginTop: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#92B7FF',
  },
  tabText: {
    color: '#8D8E99',
    fontSize: 16,
  },
  activeTabText: {
    color: '#92B7FF',
    fontWeight: '400',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 54, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  categoryText: {
    color: theme.colors.white,
    fontSize: 14,
    marginRight: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    borderRadius: 35,
    padding: 0,
    overflow: 'hidden',
    width: 350,
  },
  calendarContainer: {
    overflow: 'hidden',
    padding: 16,
    borderRadius: 35,
    width: 350,
    backgroundColor: '#23243a',
  },
});

export default styles;
