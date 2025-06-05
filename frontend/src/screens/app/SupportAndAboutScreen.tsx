import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import theme from '@theme/theme';
import GradientBorder from '../../components/common/GradientBorder';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
};

const SupportAndAboutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How to set reminders?',
      answer:
        'To set reminders, go to the Reminders tab and tap the + button. You can then specify the reminder details, including time, date, and any recurring options.',
      expanded: false,
    },
    {
      id: '2',
      question: 'What to do if the app is not working?',
      answer:
        "If you are experiencing issues with the app, try to force close the app and reopen it. If that doesn't work, try clearing the app cache or reinstalling the app. If the problem persists, please contact our support team.",
      expanded: false,
    },
    {
      id: '3',
      question: 'How to sync reminders with calendar?',
      answer:
        'To sync reminders with your calendar, go to Settings > Notifications > Calendar Sync and toggle the option to enable calendar integration. You will need to grant the necessary permissions.',
      expanded: false,
    },
    {
      id: '4',
      question: 'How to manage language settings?',
      answer:
        'To change language settings, navigate to Settings > Notifications > Language. From there, you can select your preferred language from the available options.',
      expanded: false,
    },
  ]);

  const toggleItem = (id: string) => {
    setFaqItems(
      faqItems.map(item => ({
        ...item,
        expanded: item.id === id ? !item.expanded : item.expanded,
      })),
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Support & Abouts</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>

        {faqItems.map(item => (
          <View key={item.id}>
            <GradientBorder colors={['#FFFFFF80', '#B2A1FF']} borderRadius={8} style={styles.gradientBorder}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleItem(item.id)}>
                <Text style={styles.questionText}>{item.question}</Text>
                <MaterialIcons
                  name={item.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </GradientBorder>

            {item.expanded && (
              <GradientBorder colors={['#FFFFFF80', '#B2A1FF']} borderRadius={8} style={styles.gradientContentBorder}>
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              </GradientBorder>
            )}
          </View>
        ))}
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
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
  },
  questionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  answerContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
    minHeight: 150,
  },
  answerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
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
  policyOptionText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
});

export default SupportAndAboutScreen;
