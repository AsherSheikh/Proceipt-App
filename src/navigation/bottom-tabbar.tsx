import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

const TabContainer = ({ children }) => {
  return <Pressable style={styles.container}>{children}</Pressable>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    opacity: 0.2,
  },
});

export default TabContainer;
