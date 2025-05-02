import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

export interface NotificationProps {
  type: 'friend' | 'reminder' | 'ledger' | 'workout';
  title: string;
  description: string;
  date: string;
  image?: ImageSourcePropType;
  onConfirm?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  onDelete?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  description,
  date,
  image,
  onConfirm,
  onDecline,
  onReschedule,
  onDelete,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'friend':
      case 'reminder':
        return image ? (
          <View style={styles.avatarContainer}>
            <Image source={image} style={styles.avatar} />
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#3D3F50' }]}>
              <Feather name="user" size={24} color="#FFF" />
            </View>
          </View>
        );
      case 'ledger':
        return (
          <View style={styles.avatarContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#3D3F50' }]}>
              <Feather name="dollar-sign" size={24} color="#FFF" />
            </View>
          </View>
        );
      case 'workout':
        return (
          <View style={styles.avatarContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#3D3F50' }]}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (type === 'workout') {
      return (
        <View style={styles.actionContainer}>
          <LinearGradient
            colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}>
            <View style={styles.buttonInner}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onReschedule}>
                <Feather name="refresh-cw" size={18} color="#41F577" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}>
            <View style={styles.buttonInner}>
              <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={onDelete}>
                <Feather name="trash-2" size={18} color="#ffff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={styles.actionContainer}>
        <LinearGradient
          colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}>
          <View style={styles.buttonInner}>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Feather name="check" size={18} color="#41F577" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}>
          <View style={styles.buttonInner}>
            <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={onDecline}>
              <Feather name="x" size={18} color="#A9352C" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
      start={{ x: 1, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBorder}>
      <View style={styles.notificationItem}>
        {getIcon()}
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <MaskedView
              style={styles.titleContainer}
              maskElement={<Text style={styles.title}>{title}</Text>}>
              <LinearGradient
                colors={['#B2A1FF', '#C07DDF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MaskedView>
            <Text style={styles.date}>{date}</Text>
          </View>
          <Text style={styles.description}>{description}</Text>
          {renderActions()}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 1.5,
  },
  buttonGradient: {
    borderRadius: 24,
    padding: 1,
    marginLeft: 6,
  },
  buttonInner: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  notificationItem: {
    backgroundColor: '#3a3b55',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 15,
  },
  avatarContainer: {
    marginRight: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D3F50',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    height: 30,
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    color: '#8D8E99',
    fontSize: 14,
  },
  description: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -18,
  },
  button: {
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 100,
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#3a3b55',
  },
  declineButton: {
    backgroundColor: '#3a3b55',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Notification;
