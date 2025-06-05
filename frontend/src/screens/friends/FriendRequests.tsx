import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SearchBar from '@components/SearchBar';
import FriendsNavBar from './FriendsNavBar';
import RequestList from './RequestList';
import SuggestionList from './SuggestionList';
import FriendsScreen from './FriendsScreen';
// import SuggestionList from './SuggestionList';
// import FriendsList from './FriendsList';

const FriendRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Request');
  const [search, setSearch] = useState('');

  // You can add logic to filter users based on search and activeTab

  let Content = null;
  if (activeTab === 'Request') Content = <RequestList />;
  else if (activeTab === 'Suggestion') Content = <SuggestionList />;
  else if (activeTab === 'Friends') Content = <FriendsScreen />;

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChangeText={setSearch} />
      <FriendsNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={styles.listContainer}>{Content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 160,
  },
  listContainer: {
    flex: 1,
    paddingBottom:115
  },
});

export default FriendRequests;
