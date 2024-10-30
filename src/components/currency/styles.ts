import { StyleSheet } from 'react-native';
import { theme } from 'theme';

export const styles = StyleSheet.create({
  sectionHeaderContainer: {
    paddingBottom: 6,
    backgroundColor: 'white',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    textTransform: 'uppercase',
    color: 'black',
  },
  container: {
    overflow: 'visible',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  search: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    width: '100%',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    color: theme.colors.text.primary,
  },
  section: {
    height: 500,
    borderWidth: 2,
    overflow: 'hidden',
  },
});
