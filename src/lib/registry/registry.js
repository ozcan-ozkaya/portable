/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../kubevious.git/src/lib/registry/registry.js                                                ***/

const Promise = require('the-promise');
const _ = require('lodash');
const RegistryState = require('kubevious-helpers').RegistryState;

class Registry
{
    constructor(context)
    {
        this._context = context;
        this._logger = context.logger.sublogger("Registry");

        this._currentState = new RegistryState({ date: new Date(), items: {}});
    }

    get logger() {
        return this._logger;
    }

    getCurrentState()
    {
        return this._currentState;
    }

    accept(state)
    {
        this._currentState = state;
    }

}

module.exports = Registry;