import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  Platform,
  GestureResponderEvent,
  FlatList,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import BlurViewFix from '../common/BlurViewFix';

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reminderData: ReminderData) => void;
}

export interface ReminderData {
  hour: number;
  minute: number;
  isAM: boolean;
  repeatEnabled: boolean;
  selectedDays: { [key: string]: boolean };
}

const TILL_OPTIONS = ['Forever', 'Until Date'];
const SNOOZE_OPTIONS = ['5 Min', '10 Min', '15 Min'];

const ReminderModal: React.FC<ReminderModalProps> = ({ visible, onClose, onConfirm }) => {
  const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').height));
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {}),
  );

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Dropdown state
  const [till, setTill] = useState(TILL_OPTIONS[0]);
  const [snooze, setSnooze] = useState(SNOOZE_OPTIONS[0]);
  const [showTillDropdown, setShowTillDropdown] = useState(false);
  const [showSnoozeDropdown, setShowSnoozeDropdown] = useState(false);
  const [showSetForDropdown, setShowSetForDropdown] = useState(false);

  const hour = time.getHours();
  const minute = time.getMinutes();
  const isAM = hour < 12;
  const hour12 = hour % 12 || 12;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const toggleRepeat = () => {
    setRepeatEnabled(prev => !prev);
  };

  const handleConfirm = () => {
    onConfirm({
      hour: hour12,
      minute,
      isAM,
      repeatEnabled,
      selectedDays,
    });
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setTime(selectedDate);
  };

  const handleContentPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[styles.reminderModalContainer, { transform: [{ translateY: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={handleContentPress}>
          <BlurViewFix
            style={StyleSheet.absoluteFillObject}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(35, 36, 58, 0.8)"></BlurViewFix>

          {/* Top Handle Bar */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Reminder Time Section */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderTitleRow}>
              <Text style={styles.reminderCardTitle}>Reminder</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <MaterialIcons name="edit" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.selectedTimeDisplay}
              onPress={() => setShowPicker(true)}>
              <Text style={styles.selectedTimeText}>
                {`${hour12}:${minute < 10 ? '0' : ''}${minute} ${isAM ? 'AM' : 'PM'}`}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={onChangeTime}
                is24Hour={false}
                style={{ backgroundColor: 'transparent' }}
              />
            )}
          </View>

          {/* Repeat Reminder Section */}
          <View style={styles.reminderCard}>
            <View style={styles.repeatHeaderRow}>
              <Text style={styles.reminderCardTitle}>Repeat Reminder</Text>
              <TouchableOpacity
                style={[styles.toggleSwitch, repeatEnabled && styles.toggleSwitchActive]}
                onPress={toggleRepeat}>
                <View style={[styles.toggleDot, repeatEnabled && styles.toggleDotActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, selectedDays[day] && styles.selectedDayButton]}
                  onPress={() => toggleDay(day)}
                  disabled={!repeatEnabled}>
                  <Text style={[styles.dayText, selectedDays[day] && styles.selectedDayText]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dropdowns */}
            {/* Till Dropdown */}
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTillDropdown(!showTillDropdown)}
                activeOpacity={0.8}>
                <Text style={styles.dropdownLabel}>Till</Text>
                <View style={styles.dropdownValueContainer}>
                  <Text style={styles.dropdownValue}>{till}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              {showTillDropdown && (
                <View style={styles.dropdownList}>
                  {TILL_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownListItem}
                      onPress={() => {
                        setTill(option);
                        setShowTillDropdown(false);
                      }}>
                      <Text style={styles.dropdownListItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {/* Snooze Dropdown */}
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowSnoozeDropdown(!showSnoozeDropdown)}
                activeOpacity={0.8}>
                <Text style={styles.dropdownLabel}>Snooze</Text>
                <View style={styles.dropdownValueContainer}>
                  <Text style={styles.dropdownValue}>{snooze}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              {showSnoozeDropdown && (
                <View style={styles.dropdownList}>
                  {SNOOZE_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownListItem}
                      onPress={() => {
                        setSnooze(option);
                        setShowSnoozeDropdown(false);
                      }}>
                      <Text style={styles.dropdownListItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {/* Set For Dropdown (avatar only, no options) */}
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowSetForDropdown(!showSetForDropdown)}
                activeOpacity={0.8}>
                <Text style={styles.dropdownLabel}>Set for</Text>
                <View style={styles.dropdownValueContainer}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={require('../../assets/images/user.png')}
                      style={styles.userAvatar}
                    />
                  </View>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(10, 15, 40, 0.85)',
  },
  reminderModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 0,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  reminderCard: {
    marginVertical: 10,
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(35, 36, 58, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 8,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  selectedTimeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(74,107,245,0.10)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#4a6bf5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  selectedTimeText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(74,107,245,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  repeatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    padding: 3,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,107,245,0.25)',
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(74, 107, 245, 0.5)',
    borderColor: '#4a6bf5',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a6bf5',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginHorizontal: 2,
  },
  dayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  selectedDayButton: {
    backgroundColor: 'rgba(74,107,245,0.85)',
    borderColor: '#4a6bf5',
    shadowColor: '#4a6bf5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  dayText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 36, 58, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#fff',
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#fff',
    marginRight: 5,
  },
  avatarContainer: {
    marginRight: 5,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginHorizontal: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(35, 36, 58, 0.7)',
    borderRadius: 18,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#4a6bf5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: 'rgba(74, 107, 245, 0.85)',
    borderRadius: 18,
    padding: 16,
    marginLeft: 10,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#4a6bf5',
    shadowColor: '#4a6bf5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  handleBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  handleBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 6,
  },
  dropdownList: {
    backgroundColor: 'rgba(35, 36, 58, 0.98)',
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#4a6bf5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 100,
  },
  dropdownListItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  dropdownListItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReminderModal;
