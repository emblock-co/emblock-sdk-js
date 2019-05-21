'use strict'

import fetch from 'node-fetch'
import WebSocket from 'isomorphic-ws'

const SERVER_URL = 'https://api.emblock.co'

/**
 * This is a javascript SDK to interact with a project/smart contract deployed on the Emblock platform.
 */
export default class EmblockClient {
  /**
   * Create a EmblockClient passing an ApiKey and a projectId
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
        return new Promise((resolve, reject) => {
          if (resp.ok) {
            return resolve(resp.json)
          }
          reject(Error(getErrorMessage(resp)))
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
        if (resp.ok) {
          return this.callFunctionStatus(resp.json.callId).then(response => {
            return new Promise((resolve, reject) => {
              if (response.ok) {
                return resolve({
                  status: response.json.status,
                  isSuccessful: response.json.status === 'Successful'
                })
              }
              reject(Error(getErrorMessage(response)))
            })
          })
        } else {
          return new Promise((resolve, reject) => reject(Error(getErrorMessage(resp))))
        }
      })
  }

  /**
   * Get a function status (Successful|Failed) from a callId
   * @param {string} callId callId returned by the 'callFunction'
   */
  callFunctionStatus(callId) {
    const headers = createHeaders(this.apiKey)
    const path = `${SERVER_URL}/calls/${callId}/status`
    return fetch(path, {
      method: 'GET',
      headers: headers
    }).then(parseJSON)
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
      // we need the id of the current contract of this project
      const path = `${SERVER_URL}/projects/${this.projectId}/contracts/current`
      fetch(path, {
        method: 'GET',
        headers: createHeaders(this.apiKey)
      })
        .then(parseJSON)
        .then(resp => {
          // create socket
          this.socket = new WebSocket(wsUrl)

          // on open -> subscribe to this contract events
          const contractId = resp.json.details.id
          this.socket.on('open', () => {
            const data = {
              type: 'contract_events',
              data: {
                contractId: contractId
              }
            }
            const msg = JSON.stringify(data)
            try {
              this.socket.send(msg)
            } catch (e) {
              if (cb) cb({ error: e })
            }
          })

          this.socket.on('message', message => {
            const data = JSON.parse(message)
            const eventName = data.name
            if (cb) cb({ event: eventName, params: data.params })
          })
        })
        .catch(err => {
          cb({ error: err })
        })
    }
  }
}

const getErrorMessage = function(resp) {
  const error = resp.json.error
  var errorMessage = resp.status
  if (error) errorMessage = `${errorMessage}: ${error}`
  return errorMessage
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
