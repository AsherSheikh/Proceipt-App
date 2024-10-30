module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        relativeSourceLocation: true,
      },
    ],
    ['@babel/plugin-proposal-export-namespace-from'],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.jsx', '.js', '.json'],
        alias: {
          components: './src/components/',
          theme: './src/theme/',
          assets: './src/assets/',
          screens: './src/screens/',
          features: './src/features/',
          hooks: './src/hooks/',
          hocs: './src/hocs/',
          utils: './src/utils/',
          i18n: './src/i18n/',
          navigation: './src/navigation/',
          tests: './src/tests/',
          api: './src/api/',
        },
      },
    ],
  ],
};
