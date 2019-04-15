'use strict'

import fetch from 'node-fetch'
import WebSocket from 'isomorphic-ws'

const SERVER_URL = 'https://api.emblock.co/'

/**
 * This is a javascript SDK to interact with a project/smart contract deployed on the Emblock platform.
 */
export default class EmblockClient {
  /**
   * Create a EmblockClient passing an ApiKey and a contractId
   */
  constructor(apiKey, projectId) {
    this.apiKey = apiKey
    this.projectId = projectId
  }

  /**
   * Call a constant function of the smart contract or get the value of a state
   * @param functionName the name of constant function to call
   * @param params parameters to call the constant function
   * @returns list of result
   */
  callConstant(functionName, params) {
    const headers = createHeaders(this.apiKey)
    return fetch(`${SERVER_URL}/projects/${this.projectId}/calls/current/${functionName}`, {
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
   * Call a smart contract function
   * @param {string} sender address of the sender that calls the function
   * @param {string} functionName name of the function to call
   * @param {object} params parameters of the function
   */
  callFunction(sender, functionName, params) {
    const headers = createHeaders(this.apiKey)
    if (sender) headers['wallet'] = sender
    const path = `${SERVER_URL}/projects/${this.projectId}/calls/current/${functionName}`
    return fetch(path, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    })
      .then(parseJSON)
      .then(resp => {
        return this.callFunctionStatus(resp.json.callId)
          .then(parseJSON)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                status: response.json.status,
                isSuccessful: response.json.status === 'Successful'
              })
            })
          })
      })
  }

  /**
   * Get a function status (Successful|Failed) from a callId
   * @param {string} callId callId returned by the 'callFunction'
   */
  callFunctionStatus(callId) {
    const headers = {}
    headers['content-type'] = 'application/json'
    headers['Authorization'] = `Bearer ${this.apiKey}`
    const path = `${SERVER_URL}/calls/${callId}/status`
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

const createHeaders = function(apiKey) {
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
