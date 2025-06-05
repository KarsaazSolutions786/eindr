import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Text,
  Platform,
  SafeAreaView,
} from 'react-native';
import WebView from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface PDFViewerProps {
  html: string;
  visible: boolean;
  title?: string;
  onClose: () => void;
  onShare: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  html,
  visible,
  title = 'PDF Preview',
  onClose,
  onShare,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const handleClose = () => {
    onClose();
  };

  const handleShare = () => {
    onShare();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.webViewContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2176FF" />
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            onLoad={() => setIsLoading(false)}
            style={styles.webView}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14162D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#14162D',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#14162D',
    zIndex: 1,
  },
});

export default PDFViewer;
