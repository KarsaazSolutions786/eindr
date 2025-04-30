import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface FriendsNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = ['Request', 'Suggestion', 'Friends'];

const FriendsNavBar: React.FC<FriendsNavBarProps> = ({ activeTab, setActiveTab }) => (
  <View style={styles.container}>
    <View style={styles.tabs}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}>
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <TouchableOpacity style={styles.lockIcon}>
      <AntDesign name="contacts" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(196,183,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,183,255,0.5)',
  },
  tabText: {
    color: '#C4B7FF',
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  lockIcon: {
    marginLeft: 8,
    padding: 6,
  },
});

export default FriendsNavBar;
