import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import GradientBorder from '../../components/common/GradientBorder';

type ReminderOption = {
  id: string;
  name: string;
  selected: boolean;
  isDefault?: boolean;
};

const NotificationSettingsScreen = () => {
  const [routineExpanded, setRoutineExpanded] = useState(true);
  const [urgentExpanded, setUrgentExpanded] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [routineOptions, setRoutineOptions] = useState<ReminderOption[]>([
    { id: '1', name: 'Note', selected: true, isDefault: true },
    { id: '2', name: 'Aurora', selected: false },
    { id: '3', name: 'Chord', selected: false },
    { id: '4', name: 'Circles', selected: false },
    { id: '5', name: 'Complete', selected: false },
    { id: '6', name: 'Hello', selected: false },
  ]);

  const [urgentOptions, setUrgentOptions] = useState<ReminderOption[]>([
    { id: '1', name: 'Note', selected: true },
    { id: '2', name: 'Aurora', selected: false },
    { id: '3', name: 'Chord', selected: false },
    { id: '4', name: 'Circles', selected: false },
    { id: '5', name: 'Complete', selected: false },
  ]);

  const toggleSection = (section: 'routine' | 'urgent') => {
    if (section === 'routine') {
      setRoutineExpanded(!routineExpanded);
    } else {
      setUrgentExpanded(!urgentExpanded);
    }
  };

  const selectOption = (section: 'routine' | 'urgent', id: string) => {
    if (section === 'routine') {
      setRoutineOptions(
        routineOptions.map(option => ({
          ...option,
          selected: option.id === id,
        })),
      );
    } else {
      setUrgentOptions(
        urgentOptions.map(option => ({
          ...option,
          selected: option.id === id,
        })),
      );
    }
  };

  const handleSave = () => {
    // Save notification settings here
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sounds</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Routine Reminders Section */}
        <View>
          <GradientBorder colors={['#6c6c85', '#2c2d3c']} borderRadius={8} style={styles.gradientBorder}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('routine')}>
              <Text style={styles.sectionTitle}>Routine Reminders</Text>
              <MaterialIcons
                name={routineExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </GradientBorder>

          {routineExpanded && (
            <GradientBorder colors={['#6c6c85', '#2c2d3c']} borderRadius={8} style={styles.gradientContentBorder}>
              <View style={styles.optionsContainer}>
                {routineOptions.map(option => (
                  <Pressable
                    key={option.id}
                    style={styles.optionItem}
                    onPress={() => selectOption('routine', option.id)}>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionText}>
                        {option.name} {option.isDefault ? '(Default)' : ''}
                      </Text>
                      {option.selected && <View style={styles.selectedIndicator} />}
                    </View>
                  </Pressable>
                ))}
              </View>
            </GradientBorder>
          )}
        </View>

        {/* Urgent Reminders Section */}
        <View>
          <GradientBorder colors={['#6c6c85', '#2c2d3c']} borderRadius={8} style={styles.gradientBorder}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('urgent')}>
              <Text style={styles.sectionTitle}>Urgent Reminders</Text>
              <MaterialIcons
                name={urgentExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </GradientBorder>

          {urgentExpanded && (
            <GradientBorder colors={['#6c6c85', '#2c2d3c']} borderRadius={8} style={styles.gradientContentBorder}>
              <View style={styles.optionsContainer}>
                {urgentOptions.map(option => (
                  <Pressable
                    key={option.id}
                    style={styles.optionItem}
                    onPress={() => selectOption('urgent', option.id)}>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionText}>{option.name}</Text>
                      {option.selected && <View style={styles.selectedIndicator} />}
                    </View>
                  </Pressable>
                ))}
              </View>
            </GradientBorder>
          )}
        </View>

        <View style={styles.bottomContainer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    marginBottom: 105,
  },
  container: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
  saveButton: {
    paddingHorizontal: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(35, 35, 59, 0.7)',
    overflow: 'hidden',
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 1,
    marginBottom: 10,
  },
  gradientContentBorder: {
    borderRadius: 16,
    padding: 1,
    marginTop: -5,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  optionsContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
    minHeight: 150,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#517FFF',
  },
});

export default NotificationSettingsScreen;
