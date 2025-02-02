/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;
const DefaultListener = require('./defaultlistener.js');
const TestListener = require('./testlistener.js');
const NobleDecoder = require('./nobledecoder.js');
const NobleManager = require('./noblemanager.js');


/**
 * BarnowlNoble Class
 * Converts Bluetooth Low Energy device data into standard raddec events.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
class BarnowlNoble extends EventEmitter {

  /**
   * BarnowlNoble constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};

    this.listeners = [];
    this.nobleManager = new NobleManager({ barnowl: this });
    this.nobleDecoder = new NobleDecoder({ nobleManager: this.nobleManager });
  }

  /**
   * Add a listener to the given hardware interface.
   * @param {Class} ListenerClass The (uninstantiated) listener class.
   * @param {Object} options The options as a JSON object.
   */
  addListener(ListenerClass, options) {
    options = options || {};
    options.decoder = this.nobleDecoder;

    let listener = new ListenerClass(options);
    this.listeners.push(listener);
  }

  /**
   * Handle and emit the given raddec.
   * @param {Raddec} raddec The given Raddec instance.
   */
  handleRaddec(raddec) {
    // TODO: observe options to normalise raddec
    this.emit("raddec", raddec);
  }

  /**
   * Handle and emit the given infrastructure message.
   * @param {Object} message The given infrastructure message.
   */
  handleInfrastructureMessage(message) {
    this.emit("infrastructureMessage", message);
  }
}


module.exports = BarnowlNoble;
module.exports.DefaultListener = DefaultListener;
module.exports.TestListener = TestListener;
