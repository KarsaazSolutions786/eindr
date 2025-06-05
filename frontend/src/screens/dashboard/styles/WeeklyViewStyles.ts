import { StyleSheet } from 'react-native';
import theme from '@theme/theme';

export const styles = StyleSheet.create({
  weeklyContainer: {
    flex: 1,
    paddingVertical: 2,
  },
  dateSection: {
    marginBottom: 40, // Increased spacing between date sections
    position: 'relative',
    paddingTop: 30, // Add space at the top for the date label
  },
  dateLabelContainer: {
    position: 'absolute',
    left: -10,
    top: 5,
    alignItems: 'flex-start',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8D8E99',
  },
  weeklyReminderRow: {
    flexDirection: 'row',
    marginBottom: 15,
    // paddingLeft: 5, // Adjusted for proper alignment
    paddingRight: 15,
  },
  weeklyTimeColumn: {
    width: 50,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: -8,
    position: 'relative',
  },
  weeklyTimeText: {
    fontSize: 14,
    color: '#8D8E99',
    textAlign: 'center',
    lineHeight: 17,
  },
  weeklyReminderCardContainer: {
    flex: 1,
    marginRight: -19,
  },
  weeklyReminderCard: {
    borderRadius: 16,
    padding: 15,
  },
  weeklyReminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  weeklyReminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  weeklySwitchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], // Makes the switch a bit smaller
  },
  weeklyReminderDescription: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  weeklyTimeRow: {
    marginBottom: 10,
  },
  weeklyReminderTime: {
    fontSize: 14,
    color: '#fff',
  },
  weeklyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyAppInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyAppIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  weeklyAppText: {
    fontSize: 14,
    color: '#fff',
  },
  weeklySetByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklySetByText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 5,
  },
  weeklyAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  weeklyActionButtons: {
    position: 'absolute',
    right: -5,
    top: 40,
    flexDirection: 'row',
  },
  weeklyActionButton: {
    width: 32,
    height: 32,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyTimelineLine: {
    position: 'absolute',
    top: 40,
    left: 30, // Adjusted to align with the timestamp
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(66, 103, 212, 0.25)',
    zIndex: 1,
  },
  weeklyTimelineCircle: {
    position: 'absolute',
    top: 12,
    left: -15, // Positioned to sit on the timeline
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A6BF5',
    zIndex: 2,
    shadowColor: '#4A6BF5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
});

export default styles;
