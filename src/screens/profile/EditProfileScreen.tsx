import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';
import Button from '@components/common/Button';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('Muhammad Waseem');
  const [email, setEmail] = useState('Waseem@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('0314-22222222');
  const [dateOfBirth, setDateOfBirth] = useState('16-09-2000');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    // Here you would save the profile changes
    // Then navigate back
    navigation.goBack();
  };

  const handleChoosePhoto = () => {
    // Implement photo selection logic here
    console.log('Choose photo');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={handleChoosePhoto}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Date of birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            containerStyle={styles.inputContainer}
          />
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button onPress={handleConfirm} variant="primary" fullWidth>
          Confirm
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 90,
    backgroundColor: '#333',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: 'rgba(60, 60, 100, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
});

export default EditProfileScreen;
