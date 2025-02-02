/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const BluVibManager = require('./bluvibmanager.js');
const Raddec = require('raddec');
const advlib = require('advlib-identifier');


const RECEIVER_ID_TYPE = Raddec.identifiers.TYPE_EUI48; // Assume public address


/**
 * NobleManager Class
 * Manages the Noble interfaces.
 */
class NobleManager {

  /**
   * NobleManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    this.barnowl = options.barnowl;
    this.radiosByOrigin = new Map();
    this.peripheralManagers = [ new BluVibManager() ];
  }

  /**
   * Handle peripheral decoding data
   * @param {Raddec} raddec The radio decoding data.
   * @param {String} origin The noble origin.
   * @param {Number} rssi The decoding rssi.
   */
  handleDecoding(raddec, origin, rssi) {
    let radio = retrieveRadio(this, origin);
    raddec.addDecoding({ receiverId: radio.receiverId,
                         receiverIdType: radio.receiverIdType,
                         rssi: rssi });
    this.barnowl.handleRaddec(raddec);
  }
}


/**
 * Retrieve radio identifiers from the givin origin.
 * @param {NobleManager} instance The given NobleManager instance.
 * @param {String} origin The noble origin.
 */
function retrieveRadio(instance, origin) {
  if(!instance.radiosByOrigin.has(origin)) {
    instance.radiosByOrigin.set(origin, { receiverId: origin,
                                          receiverIdType: RECEIVER_ID_TYPE });
  }

  return instance.radiosByOrigin.get(origin);
}


module.exports = NobleManager;
