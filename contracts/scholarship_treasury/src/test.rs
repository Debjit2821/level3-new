#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, Address};

#[test]
fn test_treasury_init_deposit_release() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let core_contract = Address::generate(&env);
    let student = Address::generate(&env);

    let treasury_id = env.register_contract(None, ScholarshipTreasury);
    let treasury_client = ScholarshipTreasuryClient::new(&env, &treasury_id);

    // Initialize
    treasury_client.initialize(&admin, &core_contract);

    assert_eq!(treasury_client.get_admin(), admin);
    assert_eq!(treasury_client.get_core_contract(), core_contract);
    assert_eq!(treasury_client.get_balance(), 0);

    // Deposit
    let balance = treasury_client.deposit(&admin, &1000);
    assert_eq!(balance, 1000);
    assert_eq!(treasury_client.get_balance(), 1000);

    // Release funds authorized by core_contract
    let new_bal = treasury_client.release_funds(&student, &400);
    assert_eq!(new_bal, 600);
    assert_eq!(treasury_client.get_total_disbursed(), 400);
}

#[test]
#[should_panic(expected = "Insufficient treasury balance")]
fn test_treasury_insufficient_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let core_contract = Address::generate(&env);
    let student = Address::generate(&env);

    let treasury_id = env.register_contract(None, ScholarshipTreasury);
    let treasury_client = ScholarshipTreasuryClient::new(&env, &treasury_id);

    treasury_client.initialize(&admin, &core_contract);
    treasury_client.deposit(&admin, &100);

    // Should fail as balance is 100 but request is 500
    treasury_client.release_funds(&student, &500);
}
