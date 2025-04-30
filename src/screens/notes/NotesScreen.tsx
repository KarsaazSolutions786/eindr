import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Input } from '@components/common';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import SearchBar from '@components/SearchBar';
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  isFavorite: boolean;
}

const NotesScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Party Items',
      content: 'I want to buy some items for home 1 glass, 2 tables, 2 Diet cokes, 1 su...',
      date: '12/12/12',
      isPinned: true,
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Shopping List',
      content: 'Groceries: milk, eggs, bread, fruits...',
      date: '12/12/12',
      isPinned: true,
      isFavorite: true,
    },
    {
      id: '3',
      title: 'Meeting Notes',
      content: 'Discuss project timeline and deliverables...',
      date: '12/12/12',
      isPinned: false,
      isFavorite: true,
    },
  ]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderNoteItem = (title: string, content: string, date: string) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteTitle}>{title}</Text>
      <View style={styles.noteContentRow}>
        <Text style={styles.noteDate}>{date}</Text>
        <Text style={styles.noteContent} numberOfLines={1} ellipsizeMode="tail">
          {content}
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string, isExpanded = true) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isExpanded ? (
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#FFFFFF" />
      ) : (
        <MaterialIcons name="keyboard-arrow-right" size={20} color="#FFFFFF" />
      )}
    </View>
  );

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.content.toLowerCase().includes(searchText.toLowerCase()),
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const favoriteNotes = filteredNotes.filter(note => note.isFavorite && !note.isPinned);
  const otherNotes = filteredNotes.filter(note => !note.isPinned && !note.isFavorite);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#141524" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Search Bar */}
        <SearchBar value={searchText} onChangeText={setSearchText} />

        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Pinned Notes')}
            <LinearGradient
              colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientBorder, { marginHorizontal: 16 }]}>
              <View style={styles.sectionContent}>
                {pinnedNotes.map(note => (
                  <TouchableOpacity
                    key={note.id}
                    onPress={() =>
                      navigation.navigate('NoteEdit', { id: note.id, content: note.content })
                    }>
                    {renderNoteItem(note.title, note.content, note.date)}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Favourites Section */}
        {favoriteNotes.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Favourites')}
            <LinearGradient
              colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientBorder, { marginHorizontal: 16 }]}>
              <View style={styles.sectionContent}>
                {favoriteNotes.map(note => (
                  <TouchableOpacity
                    key={note.id}
                    onPress={() =>
                      navigation.navigate('NoteEdit', { id: note.id, content: note.content })
                    }>
                    {renderNoteItem(note.title, note.content, note.date)}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Other Notes Section */}
        {otherNotes.length > 0 && (
          <TouchableOpacity style={styles.section}>
            <View style={styles.otherNotesHeader}>
              <Text style={styles.sectionTitle}>Other Notes</Text>
              <MaterialIcons name="keyboard-arrow-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#141524', // Dark background color
    marginTop:170
  },
  container: {
    flex: 1,
    // backgroundColor: '#141524',
  },
  contentContainer: {
    paddingBottom: 20,
  },

  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  otherNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: '#292B3E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  noteItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  noteTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteDate: {
    color: '#8E8E93',
    fontSize: 12,
    marginRight: 8,
  },
  noteContent: {
    color: '#8E8E93',
    fontSize: 12,
    flex: 1,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
  },
});

export default NotesScreen;
