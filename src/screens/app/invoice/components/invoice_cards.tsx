import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import { styleSheetFactory, useTheme } from '../../../../theme';
import useOrganisation from '../../../../hooks/use_organisation';
import useInvoice from '../../../../hooks/use_invoice';
import { isBeforeToday } from '../../../../utils/date';
import { calculateBalanceDue } from '../../../../utils/balance_due';
import { currencyFormatter } from '../../../../utils/currency';
import PaidIcon from '../../../../assets/svg/paid';
import UnpaidIcon from '../../../../assets/svg/unpaid';
import OverdueIcon from '../../../../assets/svg/overdue';

const InvoiceCards = () => {
  const [styles] = useTheme(Styles);
  const { organisation } = useOrganisation();
  const { invoices } = useInvoice();

  const unpaidInvoices = invoices!.filter(
    invoice => invoice.status === 'pending' && !isBeforeToday(invoice.dueAt),
  );

  const unpaidInvoicesAmount = unpaidInvoices.reduce(
    (acc, invoice) => acc + calculateBalanceDue(invoice),
    0,
  );

  const paidInvoices = invoices!.filter(invoice => invoice.status === 'paid');
  const paidInvoicesAmount = paidInvoices.reduce(
    (acc, invoice) => acc + calculateBalanceDue(invoice),
    0,
  );

  const overdueInvoices = invoices!.filter(
    invoice => isBeforeToday(invoice.dueAt) && invoice.status !== 'paid',
  );

  const overdueInvoicesAmount = overdueInvoices.reduce(
    (acc, invoice) => acc + calculateBalanceDue(invoice),
    0,
  );

  return (
    <View style={{ height: 200 }}>
      <ScrollView
        horizontal
        contentContainerStyle={{
          flexGrow: 1,
        }}
        style={{
          paddingVertical: 10,
        }}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.card, { width: 270 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>PAID</Text>
            <View
              style={[styles.cardIconContainer, { backgroundColor: '#f3f4f6' }]}
            >
              <PaidIcon />
            </View>
          </View>
          <Text style={styles.amount}>
            {currencyFormatter(organisation!.currency).format(
              paidInvoicesAmount,
            )}
          </Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{paidInvoices.length} Invoices</Text>
          </View>
        </View>

        <View style={[styles.card, { width: 270, marginHorizontal: 20 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>UNPAID</Text>
            <View
              style={[styles.cardIconContainer, { backgroundColor: '#f5f0d9' }]}
            >
              <UnpaidIcon />
            </View>
          </View>
          <Text style={styles.amount}>
            {' '}
            {currencyFormatter(organisation!.currency).format(
              unpaidInvoicesAmount,
            )}
          </Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {unpaidInvoices.length} Invoices
            </Text>
          </View>
        </View>
        <View style={[styles.card, { width: 270 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>OVERDUE</Text>
            <View
              style={[styles.cardIconContainer, { backgroundColor: '#f9e3e2' }]}
            >
              <OverdueIcon />
            </View>
          </View>
          <Text style={styles.amount}>
            {currencyFormatter(organisation!.currency).format(
              overdueInvoicesAmount,
            )}
          </Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {overdueInvoices.length} Invoices
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InvoiceCards;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    cardHead: {
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontFamily: theme.font.medium,
      fontSize: 15,
      color: '#4d5562',
    },
    amount: {
      fontFamily: theme.font.bold,
      fontSize: 24,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    chip: {
      backgroundColor: '#f3f4f6',
      paddingVertical: 6,
      borderRadius: 9999,
      color: theme.colors.grey,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
    },
    chipText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
    },
    cardIconContainer: {
      width: 35,
      height: 35,
      borderRadius: 999,
      backgroundColor: theme.colors.card.outline,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: theme.colors.card.background,
      padding: 15,
      borderRadius: 10,
      borderWidth: 0.8,
      borderColor: theme.colors.card.outline,
    },
  }),
);
