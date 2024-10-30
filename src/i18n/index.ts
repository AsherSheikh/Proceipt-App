import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as RNLocalize from 'react-native-localize';
import * as translations from './translations';

const userLocales = RNLocalize.getLocales();

// defaulting all locales to english
const locale = userLocales[0].languageCode || 'en';

const resources = {
  ...Object.fromEntries(
    Object.entries(translations).map(([key, value]) => [
      key,
      {
        translation: value,
      },
    ]),
  ),
};

use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: locale,
});

export { locale, resources };

export * as translations from './translations';
export { default } from 'i18next';
