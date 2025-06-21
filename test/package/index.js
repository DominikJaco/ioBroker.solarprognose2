const path = require('path');
const { tests } = require('@iobroker/testing');

// Run package tests
const adapterDir = path.join(__dirname, '../..');
// Führe Pakettests mit dem korrekten Pfad aus
tests.packageFiles(adapterDir);