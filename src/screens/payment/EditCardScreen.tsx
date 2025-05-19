import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';

const EditCardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardNumber, setCardNumber] = useState('4444 5555 5565566');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('12/22');
  const [cvc, setCvc] = useState('2345');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    setShowConfirmModal(true);
  };

  const confirmChanges = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleFinishSuccess = () => {
    setShowSuccessModal(false);
    navigation.replace('CardDetailsScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit card</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Input
            label="Card number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
            maxLength={19}
            containerStyle={styles.formGroup}
          />

          <Input
            label="Card holder name"
            placeholder="Enter card holder name"
            value={cardHolderName}
            onChangeText={setCardHolderName}
            containerStyle={styles.formGroup}
          />

          <Input
            label="Expires"
            value={expiryDate}
            onChangeText={setExpiryDate}
            keyboardType="number-pad"
            maxLength={5}
            containerStyle={styles.formGroup}
          />

          <Input
            label="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={false}
            containerStyle={styles.formGroup}
          />
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure you want to change card details</Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.confirmModalButton} onPress={confirmChanges}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.confirmModalButtonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.declineModalButton} onPress={closeConfirmModal}>
                <Ionicons name="close" size={20} color="#FFF" />
                <Text style={styles.declineModalButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <Text style={styles.successTitle}>Congratulations!</Text>
            <Text style={styles.successMessage}>
              Your card detail has been changed successfully
            </Text>

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
  formContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
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
  modalContainer: {
    backgroundColor: 'rgba(40, 42, 70, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  confirmModalButton: {
    backgroundColor: 'rgba(90, 215, 128, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  confirmModalButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 5,
    fontWeight: '500',
  },
  declineModalButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  declineModalButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 5,
    fontWeight: '500',
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

export default EditCardScreen;
