#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, IntoVal, Symbol,
};

#[contracttype]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum ApplicationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Completed = 3,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ScholarshipProgram {
    pub id: u64,
    pub admin: Address,
    pub title: Symbol,
    pub total_budget: i128,
    pub milestone_count: u32,
    pub amount_per_milestone: i128,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ScholarshipApplication {
    pub id: u64,
    pub program_id: u64,
    pub student: Address,
    pub student_name: Symbol,
    pub status: ApplicationStatus,
    pub paid_milestones: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TreasuryContract,
    ProgramCount,
    Program(u64),
    ApplicationCount,
    Application(u64),
}

#[contract]
pub struct ScholarshipCore;

#[contractimpl]
impl ScholarshipCore {
    /// Initialize Core contract with admin and treasury vault contract address
    pub fn initialize(env: Env, admin: Address, treasury_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TreasuryContract, &treasury_contract);
        env.storage().instance().set(&DataKey::ProgramCount, &0u64);
        env.storage().instance().set(&DataKey::ApplicationCount, &0u64);
    }

    /// Create a new scholarship program
    pub fn create_program(
        env: Env,
        admin: Address,
        title: Symbol,
        total_budget: i128,
        milestone_count: u32,
        amount_per_milestone: i128,
    ) -> u64 {
        admin.require_auth();

        if total_budget <= 0 || milestone_count == 0 || amount_per_milestone <= 0 {
            panic!("Invalid parameters");
        }

        let count: u64 = env.storage().instance().get(&DataKey::ProgramCount).unwrap_or(0);
        let program_id = count + 1;

        let program = ScholarshipProgram {
            id: program_id,
            admin: admin.clone(),
            title: title.clone(),
            total_budget,
            milestone_count,
            amount_per_milestone,
            active: true,
        };

        env.storage().persistent().set(&DataKey::Program(program_id), &program);
        env.storage().instance().set(&DataKey::ProgramCount, &program_id);

        // Publish Event
        env.events().publish(
            (symbol_short!("scholar"), symbol_short!("created")),
            (program_id, admin, title, total_budget),
        );

        program_id
    }

    /// Student submits an application for a scholarship program
    pub fn apply(env: Env, student: Address, program_id: u64, student_name: Symbol) -> u64 {
        student.require_auth();

        let program: ScholarshipProgram = env
            .storage()
            .persistent()
            .get(&DataKey::Program(program_id))
            .expect("Program not found");

        if !program.active {
            panic!("Scholarship program is inactive");
        }

        let app_count: u64 = env.storage().instance().get(&DataKey::ApplicationCount).unwrap_or(0);
        let app_id = app_count + 1;

        let app = ScholarshipApplication {
            id: app_id,
            program_id,
            student: student.clone(),
            student_name: student_name.clone(),
            status: ApplicationStatus::Pending,
            paid_milestones: 0,
        };

        env.storage().persistent().set(&DataKey::Application(app_id), &app);
        env.storage().instance().set(&DataKey::ApplicationCount, &app_id);

        // Event
        env.events().publish(
            (symbol_short!("scholar"), symbol_short!("applied")),
            (app_id, program_id, student, student_name),
        );

        app_id
    }

    /// Admin approves a student application
    pub fn approve_application(env: Env, admin: Address, application_id: u64) {
        admin.require_auth();

        let mut app: ScholarshipApplication = env
            .storage()
            .persistent()
            .get(&DataKey::Application(application_id))
            .expect("Application not found");

        let program: ScholarshipProgram = env
            .storage()
            .persistent()
            .get(&DataKey::Program(app.program_id))
            .expect("Program not found");

        if program.admin != admin {
            panic!("Unauthorized: Not program admin");
        }

        app.status = ApplicationStatus::Approved;
        env.storage().persistent().set(&DataKey::Application(application_id), &app);

        // Event
        env.events().publish(
            (symbol_short!("scholar"), symbol_short!("approved")),
            (application_id, app.student, app.program_id),
        );
    }

    /// Admin rejects a student application
    pub fn reject_application(env: Env, admin: Address, application_id: u64) {
        admin.require_auth();

        let mut app: ScholarshipApplication = env
            .storage()
            .persistent()
            .get(&DataKey::Application(application_id))
            .expect("Application not found");

        let program: ScholarshipProgram = env
            .storage()
            .persistent()
            .get(&DataKey::Program(app.program_id))
            .expect("Program not found");

        if program.admin != admin {
            panic!("Unauthorized: Not program admin");
        }

        app.status = ApplicationStatus::Rejected;
        env.storage().persistent().set(&DataKey::Application(application_id), &app);

        // Event
        env.events().publish(
            (symbol_short!("scholar"), symbol_short!("rejected")),
            (application_id, app.student),
        );
    }

    /// Trigger milestone payout for approved student (INTER-CONTRACT CALL TO TREASURY)
    pub fn trigger_milestone_payout(env: Env, admin: Address, application_id: u64) -> u32 {
        admin.require_auth();

        let mut app: ScholarshipApplication = env
            .storage()
            .persistent()
            .get(&DataKey::Application(application_id))
            .expect("Application not found");

        if app.status != ApplicationStatus::Approved {
            panic!("Application is not in Approved status");
        }

        let program: ScholarshipProgram = env
            .storage()
            .persistent()
            .get(&DataKey::Program(app.program_id))
            .expect("Program not found");

        if program.admin != admin {
            panic!("Unauthorized: Not program admin");
        }

        if app.paid_milestones >= program.milestone_count {
            panic!("All milestones have been fully paid");
        }

        // INTER-CONTRACT CALL to Scholarship Treasury contract using env.invoke_contract
        let treasury_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TreasuryContract)
            .expect("Treasury contract not set");

        let _new_vault_balance: i128 = env.invoke_contract(
            &treasury_addr,
            &Symbol::new(&env, "release_funds"),
            vec![
                &env,
                app.student.to_val(),
                program.amount_per_milestone.into_val(&env),
            ],
        );

        app.paid_milestones += 1;
        if app.paid_milestones == program.milestone_count {
            app.status = ApplicationStatus::Completed;
        }

        env.storage().persistent().set(&DataKey::Application(application_id), &app);

        // Emit Milestone Paid Event
        env.events().publish(
            (symbol_short!("scholar"), symbol_short!("payout")),
            (application_id, app.student, app.paid_milestones, program.amount_per_milestone),
        );

        app.paid_milestones
    }

    /// Query program details
    pub fn get_program(env: Env, program_id: u64) -> ScholarshipProgram {
        env.storage()
            .persistent()
            .get(&DataKey::Program(program_id))
            .expect("Program not found")
    }

    /// Query application details
    pub fn get_application(env: Env, application_id: u64) -> ScholarshipApplication {
        env.storage()
            .persistent()
            .get(&DataKey::Application(application_id))
            .expect("Application not found")
    }

    /// Query total program count
    pub fn get_program_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ProgramCount).unwrap_or(0)
    }

    /// Query total application count
    pub fn get_application_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ApplicationCount).unwrap_or(0)
    }

    /// Query admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).expect("Not initialized")
    }

    /// Query treasury contract address
    pub fn get_treasury(env: Env) -> Address {
        env.storage().instance().get(&DataKey::TreasuryContract).expect("Not initialized")
    }
}

#[cfg(test)]
mod test;
