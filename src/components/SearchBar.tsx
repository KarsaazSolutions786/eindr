import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import theme from '@theme/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  backgroundColor?: string;
  borderRadius?: number;
  fontSize?: number;
  iconColor?: string;
  containerStyle?: object;
  inputStyle?: object;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  backgroundColor = '#2d2e48',
  borderRadius = theme.borderRadius.md,
  fontSize = 22,
  iconColor = '#8E8E93',
  containerStyle,
  inputStyle,
}) => {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <LinearGradient
        colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, { borderRadius, shadowColor: '#c07ddf' }]}>
        <View style={[styles.inputContainer, { backgroundColor, borderRadius }]}>
          <MaterialIcons name="search" size={28} color={iconColor} style={styles.searchIcon} />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            value={value}
            onChangeText={onChangeText}
            style={[styles.input, { fontSize }, inputStyle]}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: theme.borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    height: '100%',
  },
});

export default SearchBar;
