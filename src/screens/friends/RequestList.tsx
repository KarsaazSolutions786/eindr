import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientBorder from '../../components/common/GradientBorder';

const users = [
  {
    id: 1,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 2,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 3,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 4,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 5,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 6,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 7,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 8,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 9,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 10,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 11,
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

const RequestList: React.FC = () => (
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
            <TouchableOpacity style={styles.confirmBtn}>
              <Ionicons
                name="checkmark-outline"
                size={22}
                color="#ffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </GradientBorder>
          <TouchableOpacity style={styles.cancelBtn}>
            <Ionicons name="close" size={22} color="#fff" />
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
  },
  username: {
    color: '#ffff',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '300',
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
  confirmBtn: {
    backgroundColor: '#30304E',
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmText: {
    color: '#ffff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    color: '#fff',
    fontSize: 18,
  },
  divider: {
    // height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 10,
    marginRight: 0,
    width: 375,
    height: 0.5,
  },
});

export default RequestList;
