# emblock-sdk-js: Emblock.co SDK for Javascript

emblock-sdk-js is a sdk for the Emblock.co platform, it can be used on client and server side.

Please check out our [website](https://emblock.co) before using our sdk.

## Table of Contents

- [Installing](#installing)
- [API docs](#api-docs)
- [Usage examples](#usage-examples)
  - [Creating an instance of EmblockClient](#creating-an-instance-of-emblockclient)
  - [Calling a constant function or get a state value](#calling-a-constant-function-or-get-a-state-value)
  - [Calling a function](#calling-a-function)
  - [Listening to events](#listening-to-events)
- [Changelog](#changelog)
- [License](#license)

## Installing

```
npm install emblock-sdk-js
```

## API docs

See [`/doc/emblock-sdk-js.md`](./doc/emblock-sdk-js.md) for Node.js-like docs for the emblock-sdk-js classes.

## Usage examples

### Creating an instance of EmblockClient

```js
const EmblockClient = require('emblock-sdk-js').default
const emblock = new EmblockClient('<API_KEY>', '<YOUR_PROJECT_ID>')
```

### Calling a constant function or get a state value

```js
// { paramName1: "<param_value_1>", paramName2: "<param_value_2>" }
const params = { owner: '0xcd92C45083aB059B1e5Af91c7cE58adf9D199e3c' }
emblock
  .callConstant('balanceOf', params)
  .then(result => {
    // result = [{"type": "uint256", "value": "100", "name": "balance"}]
    // type = type of the result
    // value = value of the result
    // name = name of the result (can be null)
    console.log('data=' + JSON.stringify(result))
  })
  .catch(err => {
    console.log('error=' + err)
  })
```

### Calling a function

We are calling the transfer function of an ERC-20 smart contract.

```js
const user1 = '0x73426F686Db8e511310a9fb90F9B22DB71ed53D4' // wallet address of the user 1
var wallet = '0xcd92C45083aB059B1e5Af91c7cE58adf9D199e3c' // wallet address of the sender
const params = { to: user1, value: '100' }
emblock
  .callFunction(wallet, 'transfer', params)
  .then(resp => {
    if (resp.isSuccessful) console.log('successful')
    else console.log('failed')
  })
  .catch(err => {
    console.log('error=' + err)
  })
```

### Call a function with client-side signature

We are calling the transfer function of an ERC-20 smart contract. The transaction is signed on client side with the given privateKey.
It returns the signature in hex format.

```js
const user1 = '0x73426F686Db8e511310a9fb90F9B22DB71ed53D4' // wallet address of the user 1
const params = { to: user1, value: '100' }
const privateKey = '<sender_private_key>'
const publicKey = '<sender_public_key>'
emblock
  .getFunctionCallSignature(publicKey, privateKey, 'transfer', params)
  .then(resp => {
    console.log('signature=' + resp)

    // ... then eth_sendRawTransaction
  })
  .catch(err => {
    console.log('error=' + err)
  })
```

### Listening to Events

Listening to events emitted by your smart contract.

```js
emblock.addEventsListener(({ event, params, error }) => {
  if (error) {
    console.log('error=' + error)
  } else {
    if (event === 'Transfer') {
      console.log('this is a Transfer event !')
    }
  }
})
```

## Changelog

We're using the GitHub [releases][changelog] for changelog entries.

## License

[MIT](LICENSE)
