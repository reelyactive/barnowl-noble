barnowl-noble
=============

__barnowl-noble__ collects data from ambient Bluetooth Low Energy devices using the noble BLE central module for Node.js, transforming it into standard developer-friendly JSON that is vendor/technology/application-agnostic.

![Overview of barnowl-noble](https://reelyactive.github.io/barnowl-noble/images/overview.png)

__barnowl-noble__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnowl-noble) that can run on resource-constrained edge devices.  It can [forward data](#pareto-anywhere-integration) to reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware suite, and can just as easily be run standalone behind a [barnowl](https://github.com/reelyactive/barnowl) instance, as detailed in the code examples below.


Pareto Anywhere Integration
---------------------------

A common application of __barnowl-noble__ is to collect Bluetooth Low Energy device data for [pareto-anywhere](https://github.com/reelyactive/pareto-anywhere) using an onboard BLE radio or adapter.  Simply follow our [Create a Pareto Anywhere startup script](https://reelyactive.github.io/diy/pareto-anywhere-startup-script/) tutorial using the script below:

```javascript
#!/usr/bin/env node

const ParetoAnywhere = require('../lib/paretoanywhere.js');

// Edit the options to customise the server
const BARNOWL_NOBLE_OPTIONS = {};

// ----- Exit gracefully if the optional dependency is not found -----
let BarnowlNoble;
try {
  BarnowlNoble = require('barnowl-noble');
}
catch(err) {
  console.log('This script requires barnowl-noble.  Install with:');
  console.log('\r\n    "npm install barnowl-noble"\r\n');
  return console.log('and then run this script again.');
}
// -------------------------------------------------------------------

let pa = new ParetoAnywhere();
pa.barnowl.addListener(BarnowlNoble, {},
                       BarnowlNoble.DefaultListener, BARNOWL_NOBLE_OPTIONS);
```

### Alternative Integration

__barnowl-noble__ also includes a script to forward data to a local [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) instance as UDP raddecs with target localhost:50001.  Start this script with the command:

    npm run forwarder

To instead forward UDP raddecs to a _remote_ Pareto Anywhere instance, start this script with the command:

    npm run forwarder xxx.xxx.xxx.xxx

where xxx.xxx.xxx.xxx is the IP address of the remote instance.

__Note:__ Any GATT data collected by __barnowl-noble__ will be lost using this approach as `protocolSpecificData` is _not_ currently supported in UDP-encoded raddecs.


Quick Start
-----------

Clone this repository and install package dependencies with `npm install`.  If installation fails on your system, validate [these installation requirements](#installation-requirements).

Then from the root folder run at any time:

    npm start

If you observe a permissions error (ex: EPERM), either [assign the necessary privileges](#assigning-privileges) (recommended) or run as root (_not_ recommended).  __barnowl-node__ will set the local Bluetooth radio to scan and print any processed [raddec](https://github.com/reelyactive/raddec) data to the console.


Supported Services and Peripheral Devices
-----------------------------------------

__barnowl-noble__ supports the following Bluetooth services and peripheral devices:

| Service UUID                         | Peripheral devices  |
|:-------------------------------------|:--------------------|
| 1c930001-d459-11e7-9296-b8e856369374 | Sensor-Works BluVib |


Assigning Privileges
--------------------

If required, assign the necessary privileges for Node.js to initiate a HCI scan on the given OS with the command:

    npm run privileges

On Linux systems (such as the Raspberry Pi) this will run the following command to grant __cap_net_raw__ privileges so that _any_ Linux user may start a scan.

    sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)


Installation Requirements
-------------------------

__barnowl-noble__ depends on the [noble](https://www.npmjs.com/package/@stoprocent/noble) package which _does not_ support all operating systems.  If your OS _is_ supported but a precompiled binary does not exist, npm will attempt to compile the binary using [node-gyp](https://www.npmjs.com/package/node-gyp) (which may need to be installed).

On Ubuntu/Debian Linux distributions, if node-gyp throws errors during installation, the _make_ and _g++_ prerequisites for compilation may need to first be installed with `sudo apt install make` and `sudo apt install build-essential` respectively.


Acknowledgements
----------------

__barnowl-noble__ is based on the [@stoprocent/noble](https://www.npmjs.com/package/@stoprocent/noble) open source Node.js package whose maintainer we invite you to consider supporting at [buymeacoffee.com/stoprocent](https://www.buymeacoffee.com/stoprocent).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2025 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
