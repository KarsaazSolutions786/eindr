import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

const ForgotPasswordScreen = () => {
  return (
    <View>
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Reset Password Button */}
      <TouchableOpacity>
        <Text>Reset Password</Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity>
        <Text>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen; 