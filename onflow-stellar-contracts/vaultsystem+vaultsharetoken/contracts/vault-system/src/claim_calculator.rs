#![no_std]

use soroban_sdk::{Env, symbol_short, Address, Map};

pub fn calculate_claimable_amount(env: &Env, user: Address) -> i128 {
    let storage = env.storage().persistent();

    let deposits: Map<Address, i128> = storage
        .get(&symbol_short!("deposits"))
        .unwrap_or(Map::new(env));
    let user_deposit = deposits.get(user.clone()).unwrap_or(0);

    if user_deposit == 0 {
        return 0;
    }

    let raised: i128 = storage.get(&symbol_short!("raised")).unwrap_or(0);
    let repaid: i128 = storage.get(&symbol_short!("repaid")).unwrap_or(0);

    if raised == 0 || repaid == 0 {
        return 0;
    }

    let total_claimable = user_deposit * repaid / raised;

    let mut claimed_map: Map<Address, i128> = storage
        .get(&symbol_short!("claimed"))
        .unwrap_or(Map::new(env));
    let already_claimed = claimed_map.get(user.clone()).unwrap_or(0);

    if already_claimed >= total_claimable {
        return 0;
    }

    let to_claim = total_claimable - already_claimed;
    claimed_map.set(user.clone(), already_claimed + to_claim);
    storage.set(&symbol_short!("claimed"), &claimed_map);

to_claim
}