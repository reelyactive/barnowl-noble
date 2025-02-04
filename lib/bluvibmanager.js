/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const BLUVIB_SERVICE_UUIDS = [
  '1c930002d45911e79296b8e856369374',
  '1c930003d45911e79296b8e856369374'
];
const BLUVIB_CHARACTERISTIC_UUIDS = [
  '1c930031d45911e79296b8e856369374',
  '1c930032d45911e79296b8e856369374',
  '1c930038d45911e79296b8e856369374',
  '1c930023d45911e79296b8e856369374',
  '1c930024d45911e79296b8e856369374',
  '1c93002bd45911e79296b8e856369374',
  '1c930029d45911e79296b8e856369374',
  '1c930020d45911e79296b8e856369374',
  '1c930030d45911e79296b8e856369374'
];
const BLUVIB_DEFAULT_ACTIONS = [
  { // Mode
    "serviceUuid": "1c930003d45911e79296b8e856369374",
    "characteristicUuid": "1c930031d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Temp
    "serviceUuid": "1c930003d45911e79296b8e856369374",
    "characteristicUuid": "1c930032d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Battery
    "serviceUuid": "1c930003d45911e79296b8e856369374",
    "characteristicUuid": "1c930038d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Sample rate
    "serviceUuid": "1c930002d45911e79296b8e856369374",
    "characteristicUuid": "1c930023d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Trace length
    "serviceUuid": "1c930002d45911e79296b8e856369374",
    "characteristicUuid": "1c930024d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Axes
    "serviceUuid": "1c930002d45911e79296b8e856369374",
    "characteristicUuid": "1c93002bd45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Calibration
    "serviceUuid": "1c930002d45911e79296b8e856369374",
    "characteristicUuid": "1c930029d45911e79296b8e856369374",
    "type": "gattRead"
  },
  { // Data: notifications
    "serviceUuid": "1c930002d45911e79296b8e856369374",
    "characteristicUuid": "1c930020d45911e79296b8e856369374",
    "type": "gattNotification"
  }
];
const BLUVIB_CONCLUDING_ACTION = { // Release
    "serviceUuid": "1c930003d45911e79296b8e856369374",
    "characteristicUuid": "1c930030d45911e79296b8e856369374",
    "value": "00",
    "type": "gattWrite"
};
const BLUVIB_TIMEOUT_MILLISECONDS = 30000;
const BLUVIB_TRACE_LENGTHS = [ 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
                               32768, 65536, 131072, 262144, 524288, 1048576,
                               2097152 ];


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
   * @param {Object} raddec The corresponding radio decoding.
   * @param {Noble} noble The noble module used in the discovery.
   * @param {function} callback The function to call on completion.
   */
  handlePeripheral(peripheral, raddec, noble, callback) {

    // Connect ----------------------------------------------------------------
    peripheral.connect((error) => {
      if(error) { return callback(null); }

      let operation = { callback: callback, raddec: raddec,
                        peripheral: peripheral, characteristics: [],
                        gatt: [], actions: BLUVIB_DEFAULT_ACTIONS,
                        numberOfAxes: 3 };
      let timeoutId = setTimeout(performConcludingActions,
                                 BLUVIB_TIMEOUT_MILLISECONDS, operation);
      operation.timeoutId = timeoutId;

      // Discover services & characteristics ----------------------------------
      peripheral.discoverSomeServicesAndCharacteristics(BLUVIB_SERVICE_UUIDS,
                                        BLUVIB_CHARACTERISTIC_UUIDS,
                                        (error, services, characteristics) => {
        if(error) {
          clearTimeout(operation.timeoutId);
          return callback(null);
        }

        operation.characteristics = characteristics;
        operation.isActionComplete =
                                new Array(operation.actions.length).fill(false);

        // Perform actions ----------------------------------------------------
        operation.actions.forEach((action, index) => {
          performAction(action, index, operation);
        });
      });
    });
  }
}


/**
 * Perform the given action on a characteristic.
 * @param {Object} action The action to perform.
 * @param {Nunber} index The action index.
 * @param {Object} operation The operation parameters.
 */
function performAction(action, index, operation) {
  let isSupportedCharacteristic = false;

  operation.characteristics.forEach((characteristic) => {
    if(characteristic.uuid === action.characteristicUuid) {
      isSupportedCharacteristic = true;
      switch(action.type) {
        case 'gattRead':
          performGattRead(characteristic, index, operation);
          break;
        case 'gattWrite':
          performGattWrite(characteristic, action.value, index, operation);
          break;
        case 'gattNotification':
          performGattNotification(characteristic, index, operation);
          break;
        default: // Unsupported action type!
          operation.isActionComplete[index] = true;
      }
    }
  });

  if(!isSupportedCharacteristic) {
    operation.isActionComplete[index] = true;
  }
}


/**
 * Perform the concluding actions of an operation.
 * @param {Object} operation The operation parameters.
 */
function performConcludingActions(operation) {
  clearTimeout(operation.timeoutId);
  operation.raddec.protocolSpecificData = { gatt: operation.gatt };
  operation.raddec.timestamp = Date.now();

  if(operation.peripheral.state === 'connected') {
    performAction(BLUVIB_CONCLUDING_ACTION, 0, operation);
  }

  return operation.callback(operation.raddec);
}


/**
 * Perform a GATT read on a characteristic.
 * @param {Object} characteristic The characteristic.
 * @param {Nunber} index The action index.
 * @param {Object} operation The operation parameters.
 */
function performGattRead(characteristic, index, operation) {
  characteristic.read((error, data) => {
    operation.isActionComplete[index] = true;
    if(error) { return; }
    operation.gatt.push({
      serviceUuid: characteristic._serviceUuid,
      characteristicUuid: characteristic.uuid,
      value: data.toString('hex')
    });
    // The Trace Length characteristic is present on all sensors
    if(characteristic.uuid === '1c930024d45911e79296b8e856369374') {
      operation.traceLength = BLUVIB_TRACE_LENGTHS[data.readUInt8()];
      operation.expectedSampleBytes = operation.traceLength *
                                      operation.numberOfAxes * 2;
    }
    // The Axes characteristic is only present on BluVib-M-V-T-3!
    if(characteristic.uuid === '1c93002bd45911e79296b8e856369374') {
      operation.numberOfAxes = data.readUInt8();
      if(operation.traceLength) {
        operation.expectedSampleBytes = operation.traceLength *
                                        operation.numberOfAxes * 2;
      }
    }
  });
}


/**
 * Perform a GATT write on a characteristic.
 * @param {Object} characteristic The characteristic.
 * @param {String} value The value as a hexadecimal string.
 * @param {Nunber} index The action index.
 * @param {Object} operation The operation parameters.
 */
function performGattWrite(characteristic, value, index, operation) {
  characteristic.write(Buffer.from(value, 'hex'), true, (error) => {
    operation.isActionComplete[index] = true;
  });
}


/**
 * Subscribe to GATT notifications on a characteristic.
 * @param {Object} characteristic The characteristic.
 * @param {Nunber} index The action index.
 * @param {Object} operation The operation parameters.
 */
function performGattNotification(characteristic, index, operation) {
  let notificationCount = 0;
  let bytesReceived = 0;
  let entry = { serviceUuid: characteristic._serviceUuid,
                characteristicUuid: characteristic.uuid,
                values: [] };

  operation.gatt.push(entry);
  characteristic.on('data', (data, isNotification) => {
    bytesReceived += data.length;
    // TODO: remove debug output
    console.log('Received', bytesReceived, 'bytes of',
                operation.expectedSampleBytes, 'bytes');
    entry.values.push(data.toString('hex'));
    if(bytesReceived >= operation.expectedSampleBytes) {
      characteristic.unsubscribe();
      operation.isActionComplete[index] = true;
      // All actions complete?
      if(operation.isActionComplete.every((element) => (element === true))) {
        return performConcludingActions(operation);
      }
      return;
    }
  });
  characteristic.subscribe((error) => {
    if(error) {
      operation.isActionComplete[index] = true;
      return;
    }
  });
}


module.exports = BluVibManager;
