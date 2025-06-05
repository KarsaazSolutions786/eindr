import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';
import Button from '@components/common/Button';

const CardDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [hasCard, setHasCard] = useState(true); // Set to false to test no-card scenario
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking if user has a card
  useEffect(() => {
    // In a real app, this would be an API call to check if the user has a saved card
    const checkForCard = async () => {
      try {
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // For demo purposes, we can toggle this to test both scenarios
        setHasCard(true);
      } catch (error) {
        console.error('Error checking for card:', error);
        setHasCard(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkForCard();
  }, []);

  // If no card exists and done loading, navigate to add card screen
  useEffect(() => {
    if (!isLoading && !hasCard) {
      navigation.replace('AddCardScreen');
    }
  }, [isLoading, hasCard, navigation]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditCard = () => {
    navigation.navigate('EditCardScreen');
  };

  const handleAddCard = () => {
    navigation.navigate('AddCardScreen');
  };

  // If still loading or no card, show loading state or nothing
  if (isLoading || !hasCard) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading card information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditCard}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Display */}
        <View style={styles.cardContainer}>
          <View style={styles.cardImageContainer}>
            <MaterialIcons name="credit-card" size={32} color="#FF5F00" style={styles.cardLogo} />
            <Text style={styles.cardType}>Master Card</Text>
            <Text style={styles.cardNumber}>**** **** 2456</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Input
            label="Card holder name"
            placeholder="Enter card holder name"
            editable={false}
            containerStyle={styles.formGroup}
          />

          <Input label="Expires" value="12/22" editable={false} containerStyle={styles.formGroup} />

          <Input label="Cvv/CVC" value="****" editable={false} containerStyle={styles.formGroup} />
        </View>

        {/* Add Card Button */}
        <Button
          onPress={handleAddCard}
          style={styles.addCardButton}
          leftIcon={
            <Ionicons name="add-circle-outline" size={22} color={theme.colors.text.primary} />
          }>
          Add New Card
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    marginTop: 20,
    marginBottom: 30,
    height: 160,
    backgroundColor: 'rgba(40, 42, 70, 0.8)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImageContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardLogo: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
  cardType: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 10,
  },
  cardNumber: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginTop: 1,
  },
  formContainer: {
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  addCardButton: {
    // marginBottom: 10,
  },
});

export default CardDetailsScreen;
