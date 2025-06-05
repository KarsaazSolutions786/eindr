import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GradientBorder from '@components/common/GradientBorder';
import LinearGradient from 'react-native-linear-gradient';

type PlansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Plans'>;

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 20px padding on both sides, 20px between cards

const featuresItems = ['Smart Voice based reminders', "Maintain Ledger's", 'Take Notes'];

const featuresHighlights = [
  {
    key: 'ai',
    title: 'AI-Powered',
    selected: true,
  },
  {
    key: 'voice',
    title: 'Smart Voice based reminders',
    selected: false,
  },
  {
    key: 'ledgers',
    title: "Maintain Ledger's",
    selected: false,
  },
  {
    key: 'notes',
    title: 'Take Notes',
    selected: false,
  },
];

const PlansScreen = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const renderBulletPoint = (text: string, index: number) => (
    <View style={styles.bulletItem} key={index}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  const renderPlanCard = (planKey: string, title: string, price: string, features: string[]) => {
    const isSelected = selectedPlan === planKey;

    // Handle the Elite plan specially to create the two-column layout
    let content;
    if (planKey === 'elite') {
      // Split features for two columns
      const leftFeatures = features.slice(0, 3);
      const rightFeatures = features.slice(3);

      content = (
        <View
          style={[
            styles.planCard,
            {
              width: '100%',
              height: 150,
              borderRadius: Platform.OS === 'android' ? 25 : 24,
            },
          ]}>
          <Text style={styles.planTitle}>{title}</Text>

          <View style={styles.eliteFeatures}>
            <View style={styles.eliteColumn}>
              {leftFeatures.map((feature, index) => renderBulletPoint(feature, index))}
            </View>
            <View style={styles.eliteColumn}>
              {rightFeatures.map((feature, index) => renderBulletPoint(feature, index))}
            </View>
          </View>
        </View>
      );
    } else {
      content = (
        <View
          style={[
            styles.planCard,
            {
              width: cardWidth,
              height: planKey === 'elite' ? 100 : 240,
              borderRadius: Platform.OS === 'android' ? 25 : 24,
            },
          ]}>
          <Text style={styles.planTitle}>{title}</Text>
          <Text style={styles.planPrice}>Price : {price}</Text>

          <Text style={styles.featuresTitle}>Key Features</Text>
          {features.map((feature, index) => renderBulletPoint(feature, index))}
        </View>
      );
    }

    if (isSelected) {
      return (
        <GradientBorder
          colors={
            Platform.OS === 'android'
              ? ['rgba(178, 161, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              : ['rgba(178, 161, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']
          }
          borderRadius={Platform.OS === 'android' ? 27 : 25}
          padding={Platform.OS === 'android' ? 2 : 1.5}
          angle={Platform.OS === 'android' ? 45 : 0}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: planKey === 'elite' ? '100%' : cardWidth,
            overflow: 'hidden',
            marginBottom: planKey === 'elite' ? 0 : 20,
          }}
          key={planKey}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan(planKey)}
            style={{
              width: '100%',
              backgroundColor: Platform.OS === 'android' ? 'transparent' : undefined,
              borderRadius: Math.max(
                0,
                (Platform.OS === 'android' ? 27 : 25) - (Platform.OS === 'android' ? 2 : 1.5),
              ),
            }}>
            {content}
          </TouchableOpacity>
        </GradientBorder>
      );
    }

    return (
      <TouchableOpacity
        key={planKey}
        activeOpacity={0.7}
        style={{ width: planKey === 'elite' ? '100%' : cardWidth }}
        onPress={() => setSelectedPlan(planKey)}>
        {content}
      </TouchableOpacity>
    );
  };

  const handleButtonPress = () => {
    if (selectedPlan) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      setSelectedPlan('starter');
    }
  };

  const getButtonText = () => {
    return selectedPlan ? 'Start 7-Days free Trial' : 'Continue';
  };

  return (
    <View style={styles.container}>
      {/* Back Button and Logo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <Image
          source={require('../../assets/Logo/indr.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text style={styles.description}>
          Your AI-powered to-do list that helps you complete tasks and manage reminders
        </Text>

        {/* Feature Highlights - Redesigned to match screenshot */}
        <View style={styles.featuresContainer}>
          <View style={styles.featuresRow}>
            <Text style={styles.aiPoweredText}>AI-Powered</Text>

            <View style={styles.otherFeaturesContainer}>
              {featuresItems.map((feature, index) => (
                <Text key={index} style={styles.featureText}>
                  {feature}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Plans Section - Top Row (Starter and Pro) */}
        <View style={styles.plansRow}>
          {renderPlanCard('starter', 'Starter Plan', '$6.99/month', [
            '50 Reminders',
            'Basic TTS voice assistant',
            'Notes & lists',
            '2 Languages',
            'Voice reminder creation',
          ])}

          {renderPlanCard('pro', 'Pro Plan', '$12.99/month', [
            'Unlimited reminders',
            'AI voice assistant + TTS',
            'Habit Tracking',
            '10 languages, share with 3 friends',
            'Calendar sync',
          ])}
        </View>

        {/* Elite Plan - Bottom Row */}
        {renderPlanCard('elite', 'Elite Plan', '', [
          'All Pro features',
          '30+ Languages',
          'Bulk commands + chat history',
          'Priority support',
          'Device sync',
        ])}

        {/* Continue Button - Update with dynamic text */}
        <View style={styles.buttonWrapper}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ alignSelf: 'center' }}>
            <TouchableOpacity
              style={[styles.continueButton, styles.buttonShadow]}
              onPress={handleButtonPress}>
              <Text style={styles.continueButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 54 : 24,
    zIndex: 10,
  },
  logo: {
    height: 60,
    width: 120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  description: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 50,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  aiPoweredText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 40,
    marginTop: 33,
  },
  otherFeaturesContainer: {
    flexDirection: 'column',
  },
  featureText: {
    color: '#9B9BAD',
    fontSize: 14,
    marginBottom: 18,
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#1E1E35',
    borderRadius: 24,
    padding: 18,
    height: 250,
    width: '100%',
    ...Platform.select({
      android: {
        elevation: 0, // Remove elevation to avoid shadow overlap with gradient
        borderWidth: 0,
      },
      ios: {},
    }),
  },
  planTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 6,
  },
  planPrice: {
    color: '#9B9BAD',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'left',
    marginTop: 4,
  },
  featuresTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    color: 'white',
    fontSize: 10,
    marginRight: 8,
    lineHeight: 13,
  },
  bulletText: {
    color: '#E0E0E0',
    fontSize: 11,
    lineHeight: 13,
    flex: 1,
  },
  eliteFeatures: {
    flexDirection: 'row',
    marginTop: 4,
  },
  eliteColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 40,
    marginBottom: 60,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: 'rgba(48, 48, 78, 1)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#FF7D73',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.38,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
        shadowColor: '#FF7D73',
      },
    }),
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlansScreen;
