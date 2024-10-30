const FIRST_NAME_REGEX = /^[\d ',.A-Za-z-]+$/g;
const LAST_NAME_REGEX = /^[\d ',.A-Za-z-]+$/g;
const UK_POSTAL_CODE_REGEX =
  /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z]\d{1,2})|(([A-Za-z][A-HJ-Ya-hj-y]\d{1,2})|(([A-Za-z]\d[A-Za-z])|([A-Za-z][A-HJ-Ya-hj-y]\d[A-Za-z]?))))\s?\d[A-Za-z]{2})/g;
const STREET_ADDRESS_REGEX = /\d+(\s\w+)(\s\w+)+/g;
const CITY_REGEX = /^([A-ZÀ-ÿ][ ',.a-z-]+ *)+(?:[\s-][A-Za-z]+)*$/g;
const HOUSE_NUMBER_REGEX = /^[1-9]\d*(?:[ -]?(?:[A-Za-z]+|[1-9]\d*))?$$/g;
const SOURCE_OF_FUNDS_REGEX = /\b([A-Za-z][ ',.a-z-]+ *)+/g;
const PURPOSE_OF_TRANSACTION_REGEX = /\b([A-Za-z][ ',.a-z-]+ *)+/g;
const BUSINESS_NAME_REGEX = /\b([A-ZÀ-ÿ][ ',.a-z-]+ *)+/g;
const BUSINESS_SERVICES_REGEX = /\b([A-ZÀ-ÿ][ ',.a-z-]+ *)+/g;
const LOWERCASE_REGEX = /^(?=.*[a-z])/;
const UPPERCASE_REGEX = /^(?=.*[A-Z])/;
const NUMBER_REGEX = /^(?=.*\d)/;
const SYMBOL_REGEX = /^(?=.*[!"#$%&()*,./:;<>?@[\]^_`{|}~’\-])/;

export const validatePassword = (password: string) => {
  let result = {
    count: false,
    symbol: false,
    uppercase: false,
    lowercase: false,
    number: false,
  };

  // count
  if (password.length >= 8) {
    result = { ...result, count: true };
  } else if (password.length < 8) {
    result = { ...result, count: false };
  }

  // symbol
  result = SYMBOL_REGEX.test(password)
    ? { ...result, symbol: true }
    : { ...result, symbol: false };

  // uppercase
  result = UPPERCASE_REGEX.test(password)
    ? { ...result, uppercase: true }
    : { ...result, uppercase: false };

  // lowercase
  result = LOWERCASE_REGEX.test(password)
    ? { ...result, lowercase: true }
    : { ...result, lowercase: false };

  // number
  result = NUMBER_REGEX.test(password)
    ? { ...result, number: true }
    : { ...result, number: false };

  return result;
};

export {
  BUSINESS_NAME_REGEX,
  BUSINESS_SERVICES_REGEX,
  CITY_REGEX,
  FIRST_NAME_REGEX,
  HOUSE_NUMBER_REGEX,
  LAST_NAME_REGEX,
  LOWERCASE_REGEX,
  NUMBER_REGEX,
  PURPOSE_OF_TRANSACTION_REGEX,
  SOURCE_OF_FUNDS_REGEX,
  STREET_ADDRESS_REGEX,
  SYMBOL_REGEX,
  UK_POSTAL_CODE_REGEX,
  UPPERCASE_REGEX,
};
