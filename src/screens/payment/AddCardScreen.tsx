import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';

const AddCardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    // Validate form fields before showing success
    if (cardNumber && cardHolderName && expiryDate && cvc) {
      setShowSuccessModal(true);
    }
  };

  const handleFinishSuccess = () => {
    setShowSuccessModal(false);
    navigation.replace('CardDetailsScreen');
  };

  // Format card number with spaces
  const handleCardNumberChange = (text: string) => {
    // Remove any non-numeric characters
    const cleanedText = text.replace(/\D/g, '');

    // Add a space after every 4 digits
    let formattedText = '';
    for (let i = 0; i < cleanedText.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedText += ' ';
      }
      formattedText += cleanedText[i];
    }

    setCardNumber(formattedText);
  };

  // Format expiry date with slash
  const handleExpiryDateChange = (text: string) => {
    // Remove any non-numeric characters
    const cleanedText = text.replace(/\D/g, '');

    // Format as MM/YY
    if (cleanedText.length > 0) {
      const month = cleanedText.substring(0, 2);
      const year = cleanedText.substring(2, 4);

      if (cleanedText.length <= 2) {
        setExpiryDate(month);
      } else {
        setExpiryDate(`${month}/${year}`);
      }
    } else {
      setExpiryDate('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add new card</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Type Icons */}
        <View style={styles.cardTypesContainer}>
          <FontAwesome5 name="cc-visa" size={30} color="#FFFFFF" style={styles.cardIcon} />
          <FontAwesome5 name="cc-mastercard" size={30} color="#FFFFFF" style={styles.cardIcon} />
          <FontAwesome5 name="cc-amex" size={30} color="#FFFFFF" style={styles.cardIcon} />
          <FontAwesome5 name="cc-discover" size={30} color="#FFFFFF" style={styles.cardIcon} />
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Input
            label="Card number"
            placeholder="XXXX XXXX XXXX XXXX"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="number-pad"
            maxLength={19} // 16 digits + 3 spaces
            containerStyle={styles.formGroup}
          />

          <Input
            label="Card holder name"
            placeholder="Enter card holder name"
            value={cardHolderName}
            onChangeText={setCardHolderName}
            containerStyle={styles.formGroup}
          />

          <View style={styles.rowContainer}>
            <Input
              label="Expires"
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
              keyboardType="number-pad"
              maxLength={5} // MM/YY format
              containerStyle={[styles.formGroup, styles.halfWidthInput]}
            />

            <Input
              label="CVC"
              placeholder="XXX"
              value={cvc}
              onChangeText={setCvc}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
              containerStyle={[styles.formGroup, styles.halfWidthInput]}
            />
          </View>

          <View style={styles.saveCardContainer}>
            <Text style={styles.saveCardText}>Save this card for future payments</Text>
            {/* You can add a toggle switch here */}
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!cardNumber || !cardHolderName || !expiryDate || !cvc) && styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={!cardNumber || !cardHolderName || !expiryDate || !cvc}>
          <Text style={styles.confirmButtonText}>Add Card</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successMessage}>Your card has been added successfully</Text>

            <TouchableOpacity
              style={[styles.confirmButton, styles.successConfirmButton]}
              onPress={handleFinishSuccess}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 30,
  },
  cardIcon: {
    marginHorizontal: 10,
  },
  formContainer: {
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidthInput: {
    width: '48%',
  },
  saveCardContainer: {
    marginTop: 10,
  },
  saveCardText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  confirmButton: {
    backgroundColor: 'rgba(90, 90, 137, 0.9)',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContainer: {
    backgroundColor: 'rgba(40, 42, 70, 0.95)',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  successConfirmButton: {
    width: '100%',
    marginTop: 20,
  },
});

export default AddCardScreen;
