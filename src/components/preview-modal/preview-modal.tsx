import CloseIcon from 'assets/svg/close';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { styleSheetFactory, useTheme } from 'theme';

type ModalProps = {
  uri: string;
  show: boolean;
  onClose: () => void;
};

const PreviewModal = ({ onClose, show, uri }: ModalProps) => {
  const [styles, theme] = useTheme(Styles);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent={true}
      visible={visible}
    >
      <View style={styles.full}>
        <Image
          resizeMode="contain"
          source={{ uri }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Pressable style={styles.closeBtn} onPress={handleClose}>
        <CloseIcon color={theme.colors.text.white} />
      </Pressable>
    </Modal>
  );
};

const Styles = styleSheetFactory(() =>
  StyleSheet.create({
    full: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    closeBtn: {
      alignItems: 'center',
      borderRadius: 5,
      height: 45,
      justifyContent: 'center',
      width: 45,
      position: 'absolute',
      top: 50,
      right: 20,
    },
    modal: {
      alignItems: 'center',
      flex: 1,
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
  }),
);

export default PreviewModal;
