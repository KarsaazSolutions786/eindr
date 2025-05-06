import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';

type LanguageOption = {
  id: string;
  name: string;
  code: string;
  selected: boolean;
  isDefault?: boolean;
  flag: string;
};

const LanguageSettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [expanded, setExpanded] = useState(true);

  const [languages, setLanguages] = useState<LanguageOption[]>([
    { id: '1', name: 'English', code: 'en', selected: true, isDefault: true, flag: '🇬🇧' },
    { id: '2', name: 'Spanish', code: 'es', selected: false, flag: '🇪🇸' },
    { id: '3', name: 'French', code: 'fr', selected: false, flag: '🇫🇷' },
    { id: '4', name: 'German', code: 'de', selected: false, flag: '🇩🇪' },
    { id: '5', name: 'Italian', code: 'it', selected: false, flag: '🇮🇹' },
    { id: '6', name: 'Portuguese', code: 'pt', selected: false, flag: '🇵🇹' },
    { id: '7', name: 'Polish', code: 'pl', selected: false, flag: '🇵🇱' },
    { id: '8', name: 'Turkish', code: 'tr', selected: false, flag: '🇹🇷' },
  ]);

  const selectLanguage = (id: string) => {
    setLanguages(
      languages.map(lang => ({
        ...lang,
        selected: lang.id === id,
      })),
    );
  };

  const handleSave = () => {
    // Here you would save the selected language
    const selectedLanguage = languages.find(lang => lang.selected);
    console.log('Saving language:', selectedLanguage?.code);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Title and Actions */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Language</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Languages Section */}
        <View>
          <LinearGradient
            colors={['#FFFFFF80', '#B2A1FF']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => setExpanded(!expanded)}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <MaterialIcons
                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </LinearGradient>

          {expanded && (
            <LinearGradient
              colors={['#FFFFFF80', '#B2A1FF']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientContentBorder}>
              <View style={styles.optionsContainer}>
                {languages.map(language => (
                  <Pressable
                    key={language.id}
                    style={styles.optionItem}
                    onPress={() => selectLanguage(language.id)}>
                    <View style={styles.optionContent}>
                      <View style={styles.languageInfo}>
                        <Text style={styles.languageFlag}>{language.flag}</Text>
                        <Text style={styles.optionText}>
                          {language.name} {language.isDefault ? '(Default)' : ''}
                        </Text>
                      </View>

                      {language.selected && <View style={styles.selectedIndicator} />}
                    </View>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 29,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  optionsContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(35, 35, 59, 0.8)',
    minHeight: 150,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 18,
    marginRight: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#517FFF',
  },
});

export default LanguageSettingsScreen;
