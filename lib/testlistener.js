/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const DEFAULT_RSSI = -70;
const MIN_RSSI = -90;
const MAX_RSSI = -50;
const RSSI_RANDOM_DELTA = 5;
const TEST_ORIGIN = '00:00:00:00:00:00';


/**
 * TestListener Class
 * Provides a consistent stream of artificially generated HCI data.
 */
class TestListener {

  /**
   * TestListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.radioDecodingPeriod = options.radioDecodingPeriod ||
                               DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS;
    this.rssi = [ DEFAULT_RSSI ];

    setInterval(emitPeripheral, this.radioDecodingPeriod, this);
  }

}


/**
 * Emit a simulated peripheral
 * @param {TestListener} instance The given instance.
 */
function emitPeripheral(instance) {
  let time = Date.now();
  let rssi = instance.rssi[0];
  let peripheral = {
      address: "7e:57:14:94:0b:1e",
      addressType: "public",
      rssi: instance.rssi[0]
  };
  updateSimulatedRssi(instance);
  instance.decoder.handlePeripheral(peripheral, TEST_ORIGIN, time, null);
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(let index = 0; index < instance.rssi.length; index++) {
    instance.rssi[index] += Math.floor((Math.random() * RSSI_RANDOM_DELTA) -
                                       (RSSI_RANDOM_DELTA / 2));
    if(instance.rssi[index] > MAX_RSSI) {
      instance.rssi[index] = MAX_RSSI;
    }
    else if(instance.rssi[index] < MIN_RSSI) {
      instance.rssi[index] = MIN_RSSI;
    }
  }
}


module.exports = TestListener;
