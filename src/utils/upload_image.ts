import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';

export const uploadImageToStorage = ({
  uri,
  folder,
}: {
  uri: string;
  folder?: string;
}): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const path = folder ? `${folder}/${uuid.v4()}` : `uploads/${uuid.v4()}`;
    const storageRef = storage().ref(path);
    const response = await fetch(uri);
    const blob = await response.blob();
    const uploadTask = storageRef.put(blob);
    uploadTask.on(
      'state_changed',
      snapshot => {},
      error => {
        reject(error);
      },
      () => {
        uploadTask.snapshot?.ref.getDownloadURL().then(downloadURL => {
          resolve(downloadURL);
        });
      },
    );
  });
};
