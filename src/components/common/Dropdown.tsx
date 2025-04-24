import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import theme from '@theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Option<T> {
  label: string;
  value: T;
}

interface DropdownProps<T> {
  label?: string;
  options: Option<T>[];
  selectedValue: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle; // Style for the main touchable area
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  selectedValueStyle?: TextStyle;
  modalItemStyle?: ViewStyle;
  modalItemTextStyle?: TextStyle;
}

const Dropdown = <T extends React.Key>({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  error,
  containerStyle,
  dropdownStyle,
  labelStyle,
  errorStyle,
  placeholderStyle,
  selectedValueStyle,
  modalItemStyle,
  modalItemTextStyle,
}: DropdownProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === selectedValue);

  const handleSelect = (value: T) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.dropdown, dropdownStyle, error && styles.dropdownError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            selectedOption ? selectedValueStyle : placeholderStyle,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon 
          name="keyboard-arrow-down"
          size={theme.typography.fontSize.xl}
          color={theme.colors.text.secondary}
          style={styles.iconStyle}
        />
      </TouchableOpacity>
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList<Option<T>>
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, modalItemStyle]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[styles.modalItemText, modalItemTextStyle]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md, // Use vertical padding like Input
    minHeight: 50, // Ensure consistent height, adjust as needed
  },
  dropdownError: {
    borderColor: theme.colors.danger,
  },
  dropdownText: {
    flex: 1, // Allow text to take space but wrap if needed
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary, // Default text color
    fontFamily: theme.typography.fontFamily.regular,
  },
  placeholderText: { // Inherits dropdownText, override color if needed
    color: theme.colors.text.placeholder,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    width: '80%',
    maxHeight: '60%',
    ...theme.shadows.lg, // Add shadow to modal
  },
  modalItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  modalItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  iconStyle: {
    marginLeft: theme.spacing.sm,
  },
});

export default Dropdown; 