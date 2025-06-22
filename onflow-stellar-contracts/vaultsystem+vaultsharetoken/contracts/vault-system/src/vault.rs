#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec, Map};

use crate::claim_calculator::calculate_claimable_amount;

#[derive(Clone, Debug, PartialEq)]
pub enum VaultState {
    Funding,
    Funded,
    Repayment,
    Claimable,
    Closed,
}

impl VaultState {
    pub fn to_symbol(&self) -> Symbol {
        match self {
            VaultState::Funding => symbol_short!("funding"),
            VaultState::Funded => symbol_short!("funded"),
            VaultState::Repayment => symbol_short!("repay"),
            VaultState::Claimable => symbol_short!("claim"),
            VaultState::Closed => symbol_short!("closed"),
        }
    }

    pub fn from_symbol(sym: &Symbol) -> VaultState {
        if *sym == symbol_short!("funding") {
            VaultState::Funding
        } else if *sym == symbol_short!("funded") {
            VaultState::Funded
        } else if *sym == symbol_short!("repay") {
            VaultState::Repayment
        } else if *sym == symbol_short!("claim") {
            VaultState::Claimable
        } else if *sym == symbol_short!("closed") {
            VaultState::Closed
        } else {
            panic!("Invalid state symbol");
        }
    }
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn initialize(
        env: Env,
        admin: Address,
        borrower: Address,
        token: Address,
        share_token: Address,
        cap: i128,
        installment_dates: Vec<u64>,
        installment_amounts: Vec<i128>,
        funding_duration: u64,
    ) {
        let storage = env.storage().persistent();
        if storage.has(&symbol_short!("inited")) {
            panic!("Already initialized");
        }

        if installment_dates.len() != installment_amounts.len() {
            panic!("Installment plan mismatch");
        }

        storage.set(&symbol_short!("admin"), &admin);
        storage.set(&symbol_short!("borrower"), &borrower);
        storage.set(&symbol_short!("token"), &token);
        storage.set(&symbol_short!("share_tok"), &share_token);
        storage.set(&symbol_short!("cap"), &cap);
        storage.set(&symbol_short!("ins_dates"), &installment_dates);
        storage.set(&symbol_short!("ins_amnts"), &installment_amounts);
        storage.set(&symbol_short!("fund_dur"), &funding_duration);
        storage.set(&symbol_short!("raised"), &0i128);
        storage.set(&symbol_short!("repaid"), &0i128);
        storage.set(&symbol_short!("state"), &VaultState::Funding.to_symbol());
        storage.set(&symbol_short!("inited"), &true);
    }

    pub fn deposit(env: Env, from: Address, amount: i128) {
        let storage = env.storage().persistent();
        let state: Symbol = storage.get(&symbol_short!("state")).unwrap();
        if VaultState::from_symbol(&state) != VaultState::Funding {
            panic!("Vault not in funding state");
        }

        let mut deposits: Map<Address, i128> = storage
            .get(&symbol_short!("deposits"))
            .unwrap_or(Map::new(&env));
        let current = deposits.get(from.clone()).unwrap_or(0);
        deposits.set(from.clone(), current + amount);
        storage.set(&symbol_short!("deposits"), &deposits);

        let raised: i128 = storage.get(&symbol_short!("raised")).unwrap_or(0);
        storage.set(&symbol_short!("raised"), &(raised + amount));
    }

    pub fn repay(env: Env, from: Address, amount: i128) {
        let storage = env.storage().persistent();
        let borrower: Address = storage.get(&symbol_short!("borrower")).unwrap();
        if from != borrower {
            panic!("Only borrower can repay");
        }

        let repaid: i128 = storage.get(&symbol_short!("repaid")).unwrap_or(0);
        storage.set(&symbol_short!("repaid"), &(repaid + amount));
    }

    pub fn claim(env: Env, user: Address) -> i128 {
        calculate_claimable_amount(&env, user)
    }

    pub fn get_vault_info(env: Env) -> (Symbol, i128, i128) {
        let storage = env.storage().persistent();
        let state: Symbol = storage.get(&symbol_short!("state")).unwrap();
        let raised: i128 = storage.get(&symbol_short!("raised")).unwrap_or(0);
        let repaid: i128 = storage.get(&symbol_short!("repaid")).unwrap_or(0);
        (state, raised, repaid)
    }
}