import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, useTheme } from '../../../theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../navigation/navigator';
import firestore from '@react-native-firebase/firestore';
import { useReadUserQuery } from '../../../features/profile/profile-reducer';
import NoReceiptIcon from '../../../assets/svg/no-receipt';
import { AppBar } from '../../../components/app_bar';
import { Organisation } from '../../../entities/organisation';
import { Star } from '../../../assets/svg/star';

const SelectOrganisationScreen = () => {
  const [styles] = useTheme(Styles);
  const [loading, setLoading] = useState(false);
  const { data, refetch: userRefetch } = useReadUserQuery();

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  useEffect(() => {
    userRefetch();
    if (!data) {
      return;
    }
    setLoading(true);
    setOrganisations([]);

    firestore()
      .collection('members-test')
      .where('userId', '==', data?.id)
      .onSnapshot(snapshot => {
        if (snapshot.size === 0 || snapshot.docs.length === 0) {
          setOrganisations([]);
          setLoading(false);
          return;
        }

        const organisationIds = snapshot.docs.map(
          doc => doc.data().organisationId,
        );
        const promises = organisationIds.map(async organisationId => {
          const doc = await firestore()
            .collection('organisations-test')
            .doc(organisationId)
            .get();
          return doc.data() as Organisation;
        });
        Promise.all(promises)
          .then(values => {
            setOrganisations(prev => [...prev, ...values]);
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            setLoading(false);
          });
      });
    /// Do not update
  }, [data, userRefetch]);

  useEffect(() => {
    if (!data) {
      return;
    }
    firestore()
      .collection('organisations-test')
      .where('userId', '==', data?.id)
      .onSnapshot(snapshot => {
        if (snapshot.size === 0 || snapshot.docs.length === 0) {
          return;
        }
        const doc = snapshot.docs[0];
        const data = doc.data() as Organisation;
        setOrganisations(prev => [data, ...prev]);
      });
  }, [data, userRefetch]);

  const renderItem = ({ item }: { item: Organisation }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          item.userId === data?.id
            ? navigate('OrganisationOwner', item)
            : navigate('OrganisationFolders', {
                name: item.name,
                id: item.id,
              })
        }
      >
        <Image
          source={{
            uri: item.logo || 'https://via.placeholder.com/150',
          }}
          style={styles.itemImage}
        />
        <Text style={styles.itemText}>{item.name}</Text>
        <View
          style={{
            flex: 1,
          }}
        />
        {item.userId === data?.id ? <Star /> : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {organisations && organisations?.length === 0 ? (
          <>
            <AppBar title={'Your Organisations'} showBack={false} />
            <View>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 300,
                }}
              >
                <NoReceiptIcon />
                <Text
                  style={{
                    marginTop: 20,
                    color: '#000',
                  }}
                >
                  You are not in any organisation!
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View
            style={{
              flex: 1,
            }}
          >
            <AppBar title={'Your Organisations'} showBack={false} />
            <FlatList
              data={organisations}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
            />
          </View>
        )}
      </View>
    </>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    appBar: {
      backgroundColor: '#fff',
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    appBarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
    },

    container: {
      flex: 1,
      width: '100%',
    },
    button: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    list: {
      flex: 1,
      width: '100%',
      marginTop: 120,
    },
    item: {
      backgroundColor: 'white',
      padding: 15,
      paddingVertical: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 16,
      alignContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    itemImage: {
      width: 40,
      height: 40,
      borderRadius: 40,
      borderWidth: 0.6,
      borderColor: theme.colors.grey.light,
    },
    itemText: {
      fontSize: 16,
      color: '#000',
      marginLeft: 10,
    },
    modalContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalText: {
      fontSize: 24,
      marginBottom: 10,
    },
    modalButton: {
      backgroundColor: 'blue',
      padding: theme.spacing.md,
      borderRadius: 5,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

export default SelectOrganisationScreen;
