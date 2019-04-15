## Functions

<dl>
<dt><a href="#callConstant">callConstant(functionName, params)</a> ⇒</dt>
<dd><p>Call a constant function of the smart contract or get the value of a state</p>
</dd>
<dt><a href="#callFunction">callFunction(sender, functionName, params)</a></dt>
<dd><p>Call a smart contract function</p>
</dd>
<dt><a href="#callFunctionStatus">callFunctionStatus(callId)</a></dt>
<dd><p>Get a function status (Successful|Failed) from a callId</p>
</dd>
</dl>

<a name="callConstant"></a>

## callConstant(functionName, params) ⇒

Call a constant function of the smart contract or get the value of a state

**Kind**: global function
**Returns**: list of result

| Param        | Description                              |
| ------------ | ---------------------------------------- |
| functionName | the name of constant function to call    |
| params       | parameters to call the constant function |

<a name="callFunction"></a>

## callFunction(sender, functionName, params)

Call a smart contract function

**Kind**: global function

| Param        | Type                | Description                                   |
| ------------ | ------------------- | --------------------------------------------- |
| sender       | <code>string</code> | address of the sender that calls the function |
| functionName | <code>string</code> | name of the function to call                  |
| params       | <code>object</code> | parameters of the function                    |

<a name="callFunctionStatus"></a>

## callFunctionStatus(callId)

Get a function status (Successful|Failed) from a callId

**Kind**: global function

| Param  | Type                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| callId | <code>string</code> | callId returned by the 'callFunction' |
