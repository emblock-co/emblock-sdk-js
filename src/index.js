'use strict'

import fetch from 'node-fetch'
import WebSocket from 'isomorphic-ws'

const SERVER_URL = 'https://api.emblock.co/'

export default class EmblockClient {
  constructor(apiKey, contractId) {
    this.apiKey = apiKey
    this.contractId = contractId
    //this.events = new Map()
  }

  /**
   * Call a constant function
   * @param functionName the name of constant function to call
   * @param params parameters to call the constant function
   * @returns list of result
   */
  callConstant(functionName, params) {
    const headers = generateHeaders(this.apiKey)
    return fetch(`${SERVER_URL}/calls/${this.contractId}/${functionName}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    })
      .then(parseJSON)
      .then(resp => {
        return new Promise(resolve => {
          if (resp.ok) {
            return resolve(resp.json)
          }
          var error = resp.json.error
          reject({
            status: resp.status,
            error: error
          })
        })
      })
  }

  /**
   * Call a function
   * @param {string} wallet pass the name of the wallet
   * @param {string} functionName name of the function
   * @param {object} params function parameters
   */
  callFunction(wallet, functionName, params) {
    const headers = generateHeaders(this.apiKey)
    if (wallet) headers['wallet'] = wallet
    const path = `${SERVER_URL}/calls/${this.contractId}/${functionName}`
    console.log('path =' + path)
    return fetch(path, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    })
      .then(parseJSON)
      .then(resp => {
        //console.log('resp=' + JSON.stringify(resp))
        return this.callFunctionStatus(resp.json.callId)
          .then(parseJSON)
          .then(response => {
            return new Promise(resolve => {
              //console.log('response=' + JSON.stringify(response.json))
              resolve({
                status: response.json.status,
                isSuccessful: response.json.status === 'Successful'
              })
            })
          })
      })
  }

  callFunctionStatus(callId) {
    const headers = {}
    headers['content-type'] = 'application/json'
    headers['Authorization'] = `Bearer ${this.apiKey}`
    const path = `${SERVER_URL}/calls/${callId}/status`
    console.log('path =' + path)
    return fetch(path, {
      method: 'GET',
      headers: headers
    }).then(this.parseJSON)
  }

  removeEventsListener() {
    if (this.socket) {
      this.socket.terminate()
      this.socket = null
    }
  }

  addEventsListener(cb) {
    const wsUrl = SERVER_URL.replace('http', 'ws').replace('https', 'wss') + '/notifs'
    // first time we call is - open the websocket
    if (!this.socket) {
      // create socket
      this.socket = new WebSocket(wsUrl)

      // on open -> subscribe to this contract events
      this.socket.on('open', () => {
        const data = {
          type: 'contract_events',
          data: {
            contractId: this.contractId
          }
        }
        const msg = JSON.stringify(data)
        console.log('onOpen=' + msg)
        this.socket.send(msg)
      })

      this.socket.on('message', message => {
        const data = JSON.parse(message)
        const eventName = data.name
        if (cb) cb({ event: eventName, params: data.params })
      })
    }
  }
}

const generateHeaders = function(apiKey) {
  const headers = {}
  headers['content-type'] = 'application/json'
  headers['Authorization'] = `Bearer ${apiKey}`
  return headers
}

const parseJSON = response => {
  return new Promise(resolve => {
    response
      .text()
      .then(text => {
        return text ? JSON.parse(text) : {}
      })
      .then(json =>
        resolve({
          status: response.status,
          ok: response.ok,
          json
        })
      )
  })
}
