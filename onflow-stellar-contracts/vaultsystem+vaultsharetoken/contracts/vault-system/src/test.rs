#![cfg(test)]

use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, Vec};
use crate::{Vault, VaultState};

#[test]
fn test_initialize_and_deposit() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let borrower = Address::generate(&env);
    let token = Address::generate(&env);
    let share_token = Address::generate(&env);

    env.ledger().with_mut(|ledger| {
        ledger.timestamp = 1000;
    });

    let cap: i128 = 1_000_000;
    let dates: Vec<u64> = Vec::from_array(&env, [2000, 3000]);
    let amts: Vec<i128> = Vec::from_array(&env, [500_000, 500_000]);
    let funding_duration: u64 = 1000;

    Vault::initialize(
        env.clone(),
        admin.clone(),
        borrower.clone(),
        token.clone(),
        share_token.clone(),
        cap,
        dates,
        amts,
        funding_duration,
    );

    let stored_cap: i128 = env
        .storage()
        .persistent()
        .get_unchecked(&"cap".into())
        .unwrap();
    assert_eq!(stored_cap, cap);

    let state: VaultState = env
        .storage()
        .persistent()
        .get_unchecked(&"state".into())
        .unwrap();
    assert_eq!(state, VaultState::Funding);
}