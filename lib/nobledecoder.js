/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const advlib = require('advlib-identifier');
const Raddec = require('raddec');


/**
 * NobleDecoder Class
 * Decodes discovered peripherals from one or more Noble instances and forwards
 * the data to the given NobleManager instance.
 */
class NobleDecoder {

  /**
   * NobleDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.nobleManager = options.nobleManager;
  }


  /**
   * Handle a discovered peripheral from the instance specified by the origin
   * @param {Object} peripheral The discovered peripheral.
   * @param {String} origin The unique origin identifier of the source.
   * @param {Number} time The time of the data capture.
   * @param {Noble} noble The noble module used in the discovery.
   */
  handlePeripheral(peripheral, origin, time, noble) {
    // TODO: check if connection required
    let isPublicAddress = (peripheral.addressType === 'public');
    let transmitterIdType = isPublicAddress ? Raddec.identifiers.TYPE_EUI48 :
                                              Raddec.identifiers.TYPE_RND48;
    let raddec = new Raddec({ transmitterId: peripheral.address,
                              transmitterIdType: transmitterIdType,
                              timestamp: time });

    this.nobleManager.handleDecoding(raddec, origin, peripheral.rssi);
  }
}


module.exports = NobleDecoder;
