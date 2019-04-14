//var EmblockClient = require('./index')
import EmblockClient from './index'

const apiKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdGhvbWFzLm5jQGdtYWlsLmNvbSIsIm9yZyI6ImRlbW8iLCJpc3MiOiJlbWJsb2NrIiwiaWF0IjoxNTU0Nzg1ODc1fQ.SVc_SjAmeGPnCYaOvLsSyUMioq4LzFuwpzwpAl3NS64'
const contractId = 'd636df58-6789-4d74-8ef8-1b5c2757ad71'
const client = new EmblockClient(apiKey, contractId)

client.addEventsListener(({ event, params }) => {
  console.log('event=' + event)
  console.log('params=' + JSON.stringify(params))

  if (event === 'Transfer') {
    console.log('this is a Transfer event !')
  }
})

client
  .callConstant('balanceOf', {
    owner: '0xcd92C45083aB059B1e5Af91c7cE58adf9D199e3c'
  })
  .then(resp => {
    console.log('data=' + JSON.stringify(resp))
  })
  .catch(err => {
    console.log('error=' + err)
  })

// wallet address or name
const user1 = '0x73426F686Db8e511310a9fb90F9B22DB71ed53D4'
var wallet = '0xcd92C45083aB059B1e5Af91c7cE58adf9D199e3c'
client
  .callFunction(wallet, 'transfer', {
    to: user1,
    value: '100'
  })
  .then(resp => {
    if (resp.isSuccessful) {
      console.log('successful')
    } else {
      console.log('failed')
    }
  })
  .catch(err => {
    console.log('error=' + err)
  })
