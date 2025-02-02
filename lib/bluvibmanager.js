/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


/**
 * BluVibManager Class
 * Manages GATT interfacing with BluVib peripherals.
 */
class BluVibManager {

  /**
   * BluVibManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) { }

  /**
   * Get the supported service UUIDs
   */
  get serviceUuids() {
    return [ '1c930001d45911e79296b8e856369374' ];
  }

  /**
   * Handle peripheral
   * @param {Object} peripheral The peripheral.
   */
  handlePeripheral(peripheral, raddec, callback) {
    // TODO: collect data and update raddec timestamp to Date.now()
    return callback(raddec);
  }
}


module.exports = BluVibManager;
