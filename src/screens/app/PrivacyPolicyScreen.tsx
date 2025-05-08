import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import LinearGradient from 'react-native-linear-gradient';
import GradientBorder from '../../components/common/GradientBorder';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacy Policy</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Terms of policy</Text>

        <GradientBorder colors={['#FFFFFF80', '#B2A1FF']} borderRadius={8} style={styles.gradientBorder}>
          <View style={styles.policyContainer}>
            <Text style={styles.policyTitle}>Privacy Policy</Text>

            <Text style={styles.policyText}>
              At Eindr, we value your privacy and are committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, store, and share your
              data when you use the Eindr mobile app and its services.
            </Text>

            <Text style={styles.policySubTitle}>1. Information We Collect</Text>
            <Text style={styles.policyText}>
              We collect various types of personal and non-personal information to provide and
              improve our services. The types of information we collect include:
            </Text>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>
                <Text style={styles.boldText}>Personal Information:</Text> Name, email, phone
                number, voice recordings, and other identifiable information.
              </Text>
            </View>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>
                <Text style={styles.boldText}>Usage Data:</Text> Information on how you use the app,
                your interactions with the app, and device information.
              </Text>
            </View>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>
                <Text style={styles.boldText}>Voice Data:</Text> If you use the voice interaction
                feature, we collect your voice inputs to process and respond to your requests.
              </Text>
            </View>

            <Text style={styles.policySubTitle}>2. How We Use Your Information</Text>
            <Text style={styles.policyText}>
              We use the collected information for various purposes, including:
            </Text>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>To provide and maintain our services</Text>
            </View>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>
                To notify you about changes to our services
              </Text>
            </View>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>To provide customer support</Text>
            </View>

            <View style={styles.bulletPointContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletPointText}>
                To gather analysis and improve our services
              </Text>
            </View>

            <Text style={styles.policySubTitle}>3. Data Security</Text>
            <Text style={styles.policyText}>
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no
              method of transmission over the Internet or electronic storage is 100% secure, and we
              cannot guarantee absolute security.
            </Text>
          </View>
        </GradientBorder>

        <View style={styles.bottomContainer} />
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
  bottomContainer: {
    marginBottom: 115,
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
  placeholder: {
    width: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 1,
    marginBottom: 20,
  },
  policyContainer: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#2a2b38',
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  policyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  policySubTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 10,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 10,
  },
  bulletPoint: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  bulletPointText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  boldText: {
    fontWeight: '500',
    color: '#fff',
  },
});

export default PrivacyPolicyScreen;
