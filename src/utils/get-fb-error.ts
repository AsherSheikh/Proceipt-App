import codes from './fb-errors.json';

export const getFbError = (errorCode: string) => {
  if (codes[errorCode]) {
    return codes[errorCode];
  }
  return 'Something went wrong. Please contact support';
};
