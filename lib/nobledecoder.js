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
    this.knownServiceUuids = prepareKnownServiceUuids(this);
  }


  /**
   * Handle a discovered peripheral from the instance specified by the origin
   * @param {Object} peripheral The discovered peripheral.
   * @param {String} origin The unique origin identifier of the source.
   * @param {Number} time The time of the data capture.
   * @param {Noble} noble The noble module used in the discovery.
   */
  handlePeripheral(peripheral, origin, time, noble) {
    let self = this;
    let isPublicAddress = (peripheral.addressType === 'public');
    let transmitterIdType = isPublicAddress ? Raddec.identifiers.TYPE_EUI48 :
                                              Raddec.identifiers.TYPE_RND48;
    let raddec = new Raddec({ transmitterId: peripheral.address,
                              transmitterIdType: transmitterIdType,
                              timestamp: time });

    // Look up the peripheral's service UUIDs against the known list
    let serviceUuids = peripheral.advertisement?.serviceUuids || [];
    let knownServiceUuid = serviceUuids.find((serviceUuid) => {
      return self.knownServiceUuids.has(serviceUuid);
    });

    // Delegate data collection to the corresponding peripheral manager
    if(knownServiceUuid) {
      let peripheralManager = self.knownServiceUuids.get(knownServiceUuid);
      peripheralManager.handlePeripheral(peripheral, raddec, noble,
                                         (raddec) => {
        if(raddec) {
          self.nobleManager.handleDecoding(raddec, origin, peripheral.rssi);
        }

        noble.startScanning([], true);
      });
    }

    this.nobleManager.handleDecoding(raddec, origin, peripheral.rssi);
  }
}


/**
 * Prepare the Map of known service UUIDs.
 * @param {NobleDecoder} instance The NobleDecoder instance.
 */
function prepareKnownServiceUuids(instance) {
  let knownServiceUuids = new Map();

  instance.nobleManager.peripheralManagers.forEach((peripheralManager) => {
    peripheralManager.serviceUuids.forEach((serviceUuid) => {
      knownServiceUuids.set(serviceUuid, peripheralManager);
    });
  });

  return knownServiceUuids;
}


module.exports = NobleDecoder;
