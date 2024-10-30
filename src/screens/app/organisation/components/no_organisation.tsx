import { StyleSheet, Text, View } from 'react-native';
import { styleSheetFactory, useTheme } from '../../../../theme';
import NoReceiptIcon from '../../../../assets/svg/no-receipt';
import ButtonComponent from '../../../../components/button/button-component';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';

const NoOrganisation = () => {
  const [styles] = useTheme(Styles);
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <NoReceiptIcon />
      <Text style={styles.emptyTitle}>Let's get started</Text>
      <Text style={styles.emptySubtitle}>
        Create an organisation to manage your Invoices
      </Text>
      <ButtonComponent
        title={'Setup Organisation'}
        onPress={() => {
          navigate('SetupOrganisation');
        }}
      />
    </View>
  );
};

export default NoOrganisation;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    emptySubtitle: {
      color: theme.colors.text.dark,
      fontSize: 15,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 18,
    },
  }),
);
