import theme from '@theme/theme';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Settings</Text>

      <ScrollView style={styles.scrollContainer}>
        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Change Password Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('ChangePasswordScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="lock" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          {/* Profile Settings Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('ProfileSettingsScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="person" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Profile Settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('NotificationSettingsScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="notifications" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Notification Settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('LanguageSettingsScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="language" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Language</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <MaterialIcons name="info" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>About App</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('SupportAndAboutScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="help" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Support & About</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
            <View style={styles.optionContent}>
              <MaterialIcons name="policy" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Development Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              Alert.alert(
                'Wake Word Demo',
                'Native Module Setup Required:\n\n' +
                  '1. Link react-native-audio-record\n' +
                  '2. Link react-native-fast-tflite\n' +
                  '3. Link react-native-permissions\n' +
                  '4. Rebuild the app\n\n' +
                  'For now, check the Home screen for a mock demo that simulates the wake word detection flow.\n\n' +
                  'All wake word code is implemented - just needs native module linking!',
                [{ text: 'OK' }],
              );
            }}>
            <View style={styles.optionContent}>
              <MaterialIcons name="mic" size={24} color={theme.colors.text.secondary} />
              <Text style={styles.optionText}>Wake Word Demo (Setup Required)</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(35, 35, 59, 0.7)',
    borderRadius: 12,
    marginBottom: 10,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: 15,
  },
});

export default SettingsScreen;
