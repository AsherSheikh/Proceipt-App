import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { styleSheetFactory, useTheme } from '../../../theme';
import { OrganisationFolder } from '../../../utils/type';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParameterList } from '../../../navigation/navigator';
import firestore from '@react-native-firebase/firestore';
import { AppBar } from '../../../components/app_bar';
import NoReceiptIcon from '../../../assets/svg/no-receipt';
import { Folder } from '../../../components/folder';

export const OrganisationOwnerScreen = () => {
  const [styles] = useTheme(Styles);
  const [folders, setFolders] = useState<OrganisationFolder[] | null>();
  const [loading, setLoading] = useState(false);
  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'OrganisationOwner'>>();
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  useEffect(() => {
    setLoading(true);
    firestore()
      .collection('folders-test')
      .where('organisationId', '==', params.id)
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => {
          return doc.data() as OrganisationFolder;
        });
        setFolders(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar title={`${params.name} Folders`} />
      {folders?.length === 0 ? (
        <View style={[styles.emptyContainer, { marginTop: 100 }]}>
          <NoReceiptIcon />
          <Text style={styles.emptyTitle}>No Assigned Folders</Text>
          <Text style={styles.emptySubtitle}>
            Contact your admin to assign you to a folder
          </Text>
        </View>
      ) : (
        <>
          <View>
            <Text style={styles.headerSubText}>
              {folders?.length} Folder(s)
            </Text>
          </View>
          <ScrollView
            style={{
              marginTop: 100,
              paddingHorizontal: 10,
            }}
          >
            <View
              style={{
                width: '100%',
              }}
            >
              {folders?.map((item, index) => (
                <Folder
                  subtitle={item.description || 'No description'}
                  icon={'mountain'}
                  organisation
                  onPress={() => {
                    navigate('AssignedFolderDetails', item);
                  }}
                  title={item.name}
                  hideAmount={true}
                  color={item.color}
                  key={index}
                />
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    appBar: {
      backgroundColor: '#fff',
      height: 75,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    appBarText: {
      fontSize: 18,
      color: '#000',
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: theme.colors.card.background,
      padding: 15,
      borderRadius: 10,
    },
    iconButton: {
      width: 50,
      height: 50,
      backgroundColor: theme.colors.grey.lighter,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    background: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    headerSubText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.regular,
      fontSize: 13,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    emptyContainer: {
      paddingTop: theme.spacing.lg,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptySubtitle: {
      color: theme.colors.text.dark,
      fontSize: 13,
      marginTop: theme.spacing.xxs,
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 18,
      marginTop: theme.spacing.xxl,
    },
  }),
);
