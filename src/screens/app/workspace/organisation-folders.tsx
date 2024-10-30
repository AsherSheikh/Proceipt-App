import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { styleSheetFactory, useTheme } from '../../../theme';
import { useEffect, useState } from 'react';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParameterList } from '../../../navigation/navigator';
import NoReceiptIcon from '../../../assets/svg/no-receipt';
import firestore from '@react-native-firebase/firestore';
import { OrganisationFolder } from '../../../utils/type';
import { useReadUserQuery } from '../../../features/profile/profile-reducer';
import { Folder } from '../../../components/folder';
import { AppBar } from '../../../components/app_bar';

export const OrganisationFoldersScreen = () => {
  const [styles] = useTheme(Styles);
  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'OrganisationFolders'>>();
  const [assignedFolders, setAssignedFolders] = useState<
    OrganisationFolder[] | null
  >([]);

  const [loading, setLoading] = useState(false);

  const { data: user, refetch: userRefetch } = useReadUserQuery();

  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  useEffect(() => {
    setLoading(true);
    userRefetch();
    if (!user) {
      return;
    }
    const organisationId = params.id;
    firestore()
      .collection('folders-test')
      .where('organisationId', '==', organisationId)
      .onSnapshot(snapshot => {
        const folders = snapshot.docs.map(doc => {
          return doc.data() as OrganisationFolder;
        });
        const folderData = folders.filter(folder => {
          return folder.members.includes(user.id);
        });
        setAssignedFolders(folderData);
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
      {assignedFolders?.length === 0 ? (
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
              {assignedFolders?.length} Folder(s)
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
              {assignedFolders?.map((item, index) => (
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
      width: '100%',
    },
    appBar: {
      backgroundColor: '#fff',
      height: 65,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      marginBottom: 15,
      flexDirection: 'row',
      paddingHorizontal: 10,
    },
    appBarText: {
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      flex: 1,
      textAlign: 'center',
    },
    card: {
      backgroundColor: 'white',
      width: 170,
      height: 100,
      marginRight: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    title: {
      fontSize: 24,
    },

    addButton: {
      position: 'absolute',
      bottom: 60,
      right: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: '100%',
      backgroundColor: '#F8F9FD',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      height: '100%',
    },
    scrollview: {
      paddingTop: 0,
      padding: theme.spacing.md,
    },
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    headerCardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
    },
    headerCard: {
      padding: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 10,
      backgroundColor: theme.colors.text.primary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerCardText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },

    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.semibold,
      fontSize: 27,
      marginLeft: theme.spacing.xs,
      width: '100%',
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
    headerSubText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.regular,
      fontSize: 13,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },

    tagContainer: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    move: {
      marginLeft: theme.spacing.xl,
      marginTop: theme.spacing.sm,
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
