import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import BlurViewFix from '@components/common/BlurViewFix';
import styles from '../styles/DashboardScreenStyles';

type MarkedDates = {
  [date: string]: {
    selected: boolean;
    selectedColor: string;
  };
};

type CalendarModalProps = {
  visible: boolean;
  selectedDates: MarkedDates;
  onDayPress: (day: DateData) => void;
  onClose: () => void;
};

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  selectedDates,
  onDayPress,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={onClose}>
        <View style={styles.calendarWrapper}>
          {/* The blur effect applied behind everything */}
          <BlurViewFix
            style={StyleSheet.absoluteFillObject}
            blurType="dark"
            blurAmount={18}
            reducedTransparencyFallbackColor="rgba(35, 36, 58, 0.8)"></BlurViewFix>

          {/* Calendar content with transparent background */}
          <TouchableOpacity
            style={styles.calendarContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <View style={styles.calendarHeader}>{/* Calendar header content if needed */}</View>

            <Calendar
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#fff',
                selectedDayBackgroundColor: '#2176FF',
                selectedDayTextColor: '#fff',
                todayTextColor: '#2176FF',
                dayTextColor: '#fff',
                textDisabledColor: '#444a6d',
                monthTextColor: '#fff',
                arrowColor: '#fff',
                stylesheet: {
                  calendar: {
                    header: {
                      week: {
                        marginTop: 7,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      },
                    },
                  },
                },
              }}
              markedDates={selectedDates}
              onDayPress={onDayPress}
              enableSwipeMonths
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CalendarModal;
