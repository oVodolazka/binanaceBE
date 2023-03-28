module.exports = {
  // 'parserOptions': {
  //     'ecmaVersion': 2018,
  // },
  'parser': '@babel/eslint-parser',
  // 'parser': 'babel-eslint',},
  'extends': [
      'eslint:recommended',
      'plugin:react/recommended'
  ],
  'overrides': [
  ],
  'parserOptions': {
      'ecmaVersion': 2018,
      'sourceType': 'module',
      'requireConfigFile': false,
  },
  'plugins': [
      'react'
  ],
  'rules': {
      'react/prop-types': ['off'],
      'react/react-in-jsx-scope': 'off',
      'no-dupe-keys':'warn'
  },
  'env': {
      'es6': true,
      'node':true,
      'es2021': true
    },
}

// // module.exports = config

