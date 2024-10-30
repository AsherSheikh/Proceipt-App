import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Invoice } from '../../../../entities/invoice';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import { formatTimestamp, isBeforeToday } from '../../../../utils/date';
import { calculateBalanceDue } from '../../../../utils/balance_due';
import { currencyFormatter } from '../../../../utils/currency';

type Props = {
  invoice: Invoice;
  onPress?: () => void;
};
const InvoiceRow = ({ invoice, onPress }: Props) => {
  const [styles] = useTheme(Styles);
  const balanceDue = calculateBalanceDue(invoice);
  const getBadgeType = () => {
    if (invoice.status === 'paid') {
      return 'badgeSuccess';
    }
    if (isBeforeToday(invoice.dueAt)) {
      return 'badgeError';
    }
    return 'badgeWarning';
  };
  const getBadgeTextColor = () => {
    if (invoice.status === 'paid') {
      return 'badgeSuccessText';
    }
    if (isBeforeToday(invoice.dueAt)) {
      return 'badgeErrorText';
    }
    return 'badgeWarningText';
  };

  const statusText = () => {
    if (invoice.status === 'paid') {
      return 'Paid';
    }
    if (isBeforeToday(invoice.dueAt)) {
      return 'Overdue';
    }
    return 'Pending';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View
        style={{
          justifyContent: 'space-between',
          flex: 1,
          marginEnd: 5,
        }}
      >
        <Text style={styles.heading}>{invoice.customer.name}</Text>
        <Text style={styles.subTitle}>#{invoice.number}</Text>
        <Text style={[styles.subTitle, { color: theme.colors.text.primary }]}>
          Due at {formatTimestamp(invoice.dueAt)}
        </Text>
      </View>
      <View>
        <Text style={styles.heading}>
          {currencyFormatter(invoice.currency).format(balanceDue)}
        </Text>
        <View style={[styles.badge, styles[getBadgeType()]]}>
          <Text style={styles[getBadgeTextColor()]}>{statusText()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceRow;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card.background,
      padding: 15,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    heading: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginBottom: 5,
      fontSize: 15,
    },
    subTitle: {
      color: theme.colors.grey.dark,
      fontFamily: theme.font.medium,
      fontSize: 13,
    },
    badge: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      borderWidth: 1,
      paddingHorizontal: 11,
      paddingVertical: 4,
      borderRadius: 100,
      textAlign: 'center',
    },
    badgeSuccessText: {
      color: '#16a34a',
      fontSize: 13,
      textTransform: 'capitalize',
    },
    badgeWarningText: {
      color: '#ca8a04',
      fontSize: 13,
      textTransform: 'capitalize',
    },
    badgeErrorText: {
      color: '#dc2626',
      fontSize: 13,
      textTransform: 'capitalize',
    },
    badgeSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      borderColor: '#16a34a',
    },
    badgeWarning: {
      backgroundColor: '#fefce8',
      color: '#ca8a04',
      borderColor: '#ca8a04',
    },
    badgeError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#dc2626',
    },
  }),
);
