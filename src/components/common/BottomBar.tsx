import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import theme from '@theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import LinearGradient from 'react-native-linear-gradient';
import Menu from '../../assets/Icons/Menu';

const BottomBar: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Main tabs container with its own background */}
      <View style={styles.mainBackground}>
        <View style={styles.blurBackground}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="#292A38"
          />
        </View>

        <View style={styles.leftSide}>
          {/* Home Button */}
          <TouchableOpacity
            style={styles.homeTabContainer}
            onPress={() => {
              try {
                navigation.navigate('Home');
              } catch (e) {
                console.log('Navigation error:', e);
              }
            }}>
            <LinearGradient
              colors={['rgba(157, 157, 255, 0.3)', 'rgba(39, 39, 54, 0.42)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.homeTab}>
              <View style={styles.homeContent}>
                <MaterialIcons
                  name="home"
                  size={24}
                  color={theme.colors.white}
                  style={styles.homeIcon}
                />
                <Text style={styles.homeLabel}>Home</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Calendar Button */}
          <TouchableOpacity
            style={styles.iconTab}
            onPress={() => {
              try {
                navigation.navigate('Calendar');
              } catch (e) {
                console.log('Navigation error:', e);
              }
            }}>
            <MaterialIcons name="calendar-today" size={25} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Menu Button */}
          <TouchableOpacity
            style={styles.iconTab}
            onPress={() => {
              try {
                navigation.navigate('Settings');
              } catch (e) {
                console.log('Navigation error:', e);
              }
            }}>
            <Menu width={37} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Keyboard button with blur effect */}
      <TouchableOpacity
        style={styles.keyboardButton}
        onPress={() => {
          try {
            navigation.navigate('Keyboard');
          } catch (e) {
            console.log('Navigation error:', e);
          }
        }}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={15}
          // reducedTransparencyFallbackColor="#ffffff"
        />
        <MaterialIcons name="keyboard" size={31} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 90,
    paddingBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBackground: {
    height: 75,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 29,
    width: 240,
    // backgroundColor: '#FFFFFF1A',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  homeTabContainer: {
    width: 100,
    height: 50,
    borderRadius: 25,
    position: 'relative',
    marginRight: 10,
  },
  homeTab: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  homeContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  iconTab: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    borderRadius: 22,
    marginHorizontal: 5,
  },
  homeIcon: {
    marginRight: 8,
  },
  homeLabel: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  keyboardButton: {
    width: 75,
    height: 75,
    borderRadius: 37,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomBar;
