// Lee el README
const os = require('os');

// It returns hostname of system
console.log("Hostname: " + os.hostname());

// It return operating system name
console.log("Operating system name: " + os.version());

// total memory MB
const totalMemMB = os.totalmem() / (1024 * 1024);
console.log("Total RAM: " + totalMemMB.toFixed(2) + " MB");