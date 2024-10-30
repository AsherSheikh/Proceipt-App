import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

const deleteToken = () => messaging().deleteToken();

const subscribeToTopic = (topic: string) => messaging().subscribeToTopic(topic);

const createDefaultChannel = () =>
  notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    sound: 'default',
    importance: AndroidImportance.DEFAULT,
    vibration: true,
  });

export { createDefaultChannel, deleteToken, subscribeToTopic };
