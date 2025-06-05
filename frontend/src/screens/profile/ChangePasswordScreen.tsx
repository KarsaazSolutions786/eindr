import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    // Validate inputs
    const newErrors = {
      currentPassword: currentPassword ? '' : 'Current password is required',
      newPassword: newPassword ? '' : 'New password is required',
      confirmPassword: confirmPassword !== newPassword ? 'Passwords do not match' : '',
    };

    setErrors(newErrors);

    // If no errors, proceed with password change
    if (!newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword) {
      // Save password change logic here
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change Password</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isPassword
          error={errors.currentPassword}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          error={errors.newPassword}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Confirm Password"
          placeholder="Enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          error={errors.confirmPassword}
          containerStyle={styles.inputContainer}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  saveButton: {
    paddingHorizontal: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 70,
  },
  inputContainer: {
    marginBottom: 20,
  },
});

export default ChangePasswordScreen;
