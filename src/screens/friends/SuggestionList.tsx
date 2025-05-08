import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GradientBorder from '../../components/common/GradientBorder';

const users = [
  {
    id: 1,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 2,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: 3,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: 4,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: 5,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 6,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    id: 7,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
];

const SuggestionList: React.FC = () => (
  <FlatList
    data={users}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item }) => (
      <>
        <View style={styles.userRow}>
          <Image source={{ uri: item.profilePic }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>{item.username}</Text>
          </View>
          <GradientBorder
            colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            borderRadius={8}
            style={styles.gradientBorder}>
            <TouchableOpacity style={styles.addBtn}>
              <MaterialIcons name="person-add" size={20} color="#ffff" style={{ marginRight: 6 }} />
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </GradientBorder>
          <TouchableOpacity style={styles.cancelBtn}>
            <MaterialIcons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </>
    )}
    contentContainerStyle={{ paddingBottom: 20 }}
    showsVerticalScrollIndicator={false}
  />
);

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    // fontWeight: '900',
  },
  username: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 2,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
    shadowColor: '#c07ddf',
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#30304E',
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    color: '#ffff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelBtn: {
    padding: 4,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 10,
    marginRight: 0,
    width: 375,
    height: 0.5,
  },
});

export default SuggestionList;
