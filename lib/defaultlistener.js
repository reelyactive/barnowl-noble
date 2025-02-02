/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const noble = require('@stoprocent/noble');


/**
 * DefaultListener Class
 * Listens for data from a default Noble instance.
 */
class DefaultListener {

  /**
   * DefaultListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.decoder = options.decoder;
    this.origin = 'default';
    this.isScanning = false;

    handleNobleEvents(self);
  }

}


/**
 * Handle noble events.
 * @param {DefaultListener} instance The DefaultListener instance.
 */
function handleNobleEvents(instance) {
  noble.on('stateChange', (state) => {
    if(state === 'poweredOn') {
      instance.origin = noble.address;
      noble.startScanning(); // TODO: filters?
    }
  });

  noble.on('discover', (peripheral) => {
    instance.decoder.handlePeripheral(peripheral, instance.origin, Date.now(),
                                      noble);
  });

  noble.on('scanStart', () => { instance.isScanning = true; });
  noble.on('scanStop', () => { instance.isScanning = false; });

  noble.on('warning', (message) => {
    console.log('barnowl-noble warning:', message);
  });
}


module.exports = DefaultListener;
