import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Customer } from '../../../../entities/customer';
import { styleSheetFactory, useTheme } from '../../../../theme';
import { DotsIcon } from '../../../../assets/svg/dots';
import React from 'react';

type Props = {
  client: Customer;
  onPress?: () => void;
};
const ClientRow = ({ client, onPress }: Props) => {
  const [styles] = useTheme(Styles);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.heading}>{client.name}</Text>
        {client.email && <Text style={styles.email}>{client.email}</Text>}
      </View>
      <TouchableOpacity style={styles.iconBtn} onPress={onPress}>
        <DotsIcon />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ClientRow;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card.background,
      padding: 15,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      alignItems: 'center',
    },
    email: {
      color: theme.colors.grey.dark,
      fontFamily: theme.font.medium,
      fontSize: 13,
    },
    iconBtn: {
      backgroundColor: '#f3f4f6',
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    heading: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginBottom: 5,
      fontSize: 15,
    },
  }),
);
