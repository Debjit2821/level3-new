#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    CoreContract,
    Balance,
    TotalDisbursed,
}

#[contract]
pub struct ScholarshipTreasury;

#[contractimpl]
impl ScholarshipTreasury {
    /// Initialize the Treasury contract with an admin and authorized scholarship core contract
    pub fn initialize(env: Env, admin: Address, core_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Treasury already initialized");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CoreContract, &core_contract);
        env.storage().instance().set(&DataKey::Balance, &0i128);
        env.storage().instance().set(&DataKey::TotalDisbursed, &0i128);
    }

    /// Deposit funds into the Treasury pool
    pub fn deposit(env: Env, from: Address, amount: i128) -> i128 {
        from.require_auth();
        if amount <= 0 {
            panic!("Deposit amount must be positive");
        }

        let current_balance: i128 = env.storage().instance().get(&DataKey::Balance).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().instance().set(&DataKey::Balance, &new_balance);

        // Publish Deposit Event
        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("deposit")),
            (from, amount, new_balance),
        );

        new_balance
    }

    /// Release funds to student beneficiary. Executed ONLY by the authorized Scholarship Core Contract.
    pub fn release_funds(env: Env, to: Address, amount: i128) -> i128 {
        let core_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::CoreContract)
            .expect("Core contract not set");

        // Verify caller authorization: core_contract must require auth
        core_contract.require_auth();

        if amount <= 0 {
            panic!("Release amount must be positive");
        }

        let current_balance: i128 = env.storage().instance().get(&DataKey::Balance).unwrap_or(0);
        if current_balance < amount {
            panic!("Insufficient treasury balance");
        }

        let new_balance = current_balance - amount;
        env.storage().instance().set(&DataKey::Balance, &new_balance);

        let current_disbursed: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDisbursed)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDisbursed, &(current_disbursed + amount));

        // Publish Fund Release Event
        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("released")),
            (to, amount, new_balance),
        );

        new_balance
    }

    /// Update the authorized core contract address
    pub fn set_core_contract(env: Env, new_core: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Treasury not initialized");
        admin.require_auth();

        env.storage().instance().set(&DataKey::CoreContract, &new_core);
    }

    /// Query current vault balance
    pub fn get_balance(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Balance).unwrap_or(0)
    }

    /// Query total funds disbursed
    pub fn get_total_disbursed(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalDisbursed).unwrap_or(0)
    }

    /// Query admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).expect("Not initialized")
    }

    /// Query core contract address
    pub fn get_core_contract(env: Env) -> Address {
        env.storage().instance().get(&DataKey::CoreContract).expect("Not initialized")
    }
}

#[cfg(test)]
mod test;
