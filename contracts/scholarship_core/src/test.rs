#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{symbol_short, Address, Env};
use scholarship_treasury::ScholarshipTreasury;

#[test]
fn test_scholarship_full_lifecycle_and_inter_contract_payout() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let student = Address::generate(&env);

    // Register Treasury Contract
    let treasury_id = env.register_contract(None, ScholarshipTreasury);
    let treasury_client = scholarship_treasury::ScholarshipTreasuryClient::new(&env, &treasury_id);

    // Register Core Contract
    let core_id = env.register_contract(None, ScholarshipCore);
    let core_client = ScholarshipCoreClient::new(&env, &core_id);

    // Initialize Treasury and Core
    treasury_client.initialize(&admin, &core_id);
    core_client.initialize(&admin, &treasury_id);

    // Deposit funds into Treasury pool
    treasury_client.deposit(&admin, &10000);
    assert_eq!(treasury_client.get_balance(), 10000);

    // 1. Admin creates scholarship program: 2000 total budget, 2 milestones, 1000 per milestone
    let prog_id = core_client.create_program(
        &admin,
        &symbol_short!("STEM_2026"),
        &2000,
        &2,
        &1000,
    );
    assert_eq!(prog_id, 1);

    let prog = core_client.get_program(&prog_id);
    assert_eq!(prog.milestone_count, 2);

    // 2. Student applies
    let app_id = core_client.apply(&student, &prog_id, &symbol_short!("Alice"));
    assert_eq!(app_id, 1);

    let app_pending = core_client.get_application(&app_id);
    assert_eq!(app_pending.status, ApplicationStatus::Pending);

    // 3. Admin approves applicant
    core_client.approve_application(&admin, &app_id);
    let app_approved = core_client.get_application(&app_id);
    assert_eq!(app_approved.status, ApplicationStatus::Approved);

    // 4. Trigger Milestone 1 payout (Executes Inter-Contract Call from Core to Treasury)
    let paid_m1 = core_client.trigger_milestone_payout(&admin, &app_id);
    assert_eq!(paid_m1, 1);
    assert_eq!(treasury_client.get_balance(), 9000); // 10000 - 1000

    let app_m1 = core_client.get_application(&app_id);
    assert_eq!(app_m1.status, ApplicationStatus::Approved);
    assert_eq!(app_m1.paid_milestones, 1);

    // 5. Trigger Milestone 2 payout (Final milestone)
    let paid_m2 = core_client.trigger_milestone_payout(&admin, &app_id);
    assert_eq!(paid_m2, 2);
    assert_eq!(treasury_client.get_balance(), 8000); // 9000 - 1000

    let app_completed = core_client.get_application(&app_id);
    assert_eq!(app_completed.status, ApplicationStatus::Completed);
}

#[test]
#[should_panic(expected = "Application is not in Approved status")]
fn test_payout_without_approval_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let student = Address::generate(&env);

    let treasury_id = env.register_contract(None, ScholarshipTreasury);
    let treasury_client = scholarship_treasury::ScholarshipTreasuryClient::new(&env, &treasury_id);

    let core_id = env.register_contract(None, ScholarshipCore);
    let core_client = ScholarshipCoreClient::new(&env, &core_id);

    treasury_client.initialize(&admin, &core_id);
    core_client.initialize(&admin, &treasury_id);

    let prog_id = core_client.create_program(&admin, &symbol_short!("MERIT"), &1000, &1, &1000);
    let app_id = core_client.apply(&student, &prog_id, &symbol_short!("Bob"));

    // Attempting payout on PENDING application should panic
    core_client.trigger_milestone_payout(&admin, &app_id);
}

#[test]
#[should_panic(expected = "Unauthorized: Not program admin")]
fn test_unauthorized_approval_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let rogue = Address::generate(&env);
    let student = Address::generate(&env);

    let treasury_id = env.register_contract(None, ScholarshipTreasury);
    let core_id = env.register_contract(None, ScholarshipCore);
    let core_client = ScholarshipCoreClient::new(&env, &core_id);

    let prog_id = core_client.create_program(&admin, &symbol_short!("MERIT"), &1000, &1, &1000);
    let app_id = core_client.apply(&student, &prog_id, &symbol_short!("Bob"));

    // Rogue user attempts to approve application
    core_client.approve_application(&rogue, &app_id);
}
