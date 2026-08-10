/**
 * Mock Screenshot metadata generator for README visual preview.
 */
const fs = require('fs');
const path = require('path');

const screenshots = [
  {
    name: 'Dashboard Admin View',
    file: 'dashboard-admin.png',
    description: 'Administrator dashboard for creating programs, approving applications, and executing milestone payouts.',
  },
  {
    name: 'Student View',
    file: 'dashboard-student.png',
    description: 'Student dashboard displaying scholarship eligibility, milestone progression, and received XLM payouts.',
  },
  {
    name: 'Real-Time Activity Stream',
    file: 'activity-stream.png',
    description: 'Live Soroban contract event feed streaming contract events and raw payload inspector.',
  },
  {
    name: 'Transaction Management Center',
    file: 'tx-center.png',
    description: 'Transaction status tracker showing hashes, Stellar explorer links, and retry mechanisms.',
  },
];

console.log('Generated screenshot metadata manifest:');
console.log(JSON.stringify(screenshots, null, 2));
