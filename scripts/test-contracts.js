const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const coreCargoPath = path.join(__dirname, '../contracts/scholarship_core/Cargo.toml');
const treasuryCargoPath = path.join(__dirname, '../contracts/scholarship_treasury/Cargo.toml');

const cleanPath = [
  'C:\\Users\\debji\\.rustup\\toolchains\\stable-x86_64-pc-windows-gnu\\lib\\rustlib\\x86_64-pc-windows-gnu\\bin\\self-contained',
  ...process.env.PATH.split(';')
].join(';');

console.log('Automating Cargo.toml modification to bypass Windows DLL symbol limits...');

const coreBackup = fs.readFileSync(coreCargoPath, 'utf8');
const treasuryBackup = fs.readFileSync(treasuryCargoPath, 'utf8');

try {
  // Convert to rlib only for local testing
  fs.writeFileSync(coreCargoPath, coreBackup.replace('crate-type = ["cdylib", "rlib"]', 'crate-type = ["rlib"]'));
  fs.writeFileSync(treasuryCargoPath, treasuryBackup.replace('crate-type = ["cdylib", "rlib"]', 'crate-type = ["rlib"]'));

  console.log('Running cargo test --all --jobs 1 with sanitized PATH...');
  execSync('cargo test --all --jobs 1', {
    env: { ...process.env, PATH: cleanPath },
    stdio: 'inherit',
  });
  console.log('\n✅ All Soroban Smart Contract Rust tests passed successfully!');
} catch (err) {
  console.error('\n❌ Cargo test failed:', err.message);
  process.exit(1);
} finally {
  console.log('Restoring original Cargo.toml configurations...');
  fs.writeFileSync(coreCargoPath, coreBackup);
  fs.writeFileSync(treasuryCargoPath, treasuryBackup);
}
