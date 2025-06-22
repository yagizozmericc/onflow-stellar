#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address, Map, IntoVal};

#[contract]
pub struct VaultShareToken;

#[contractimpl]
impl VaultShareToken {
    pub fn initialize(env: Env, admin: Address, name: Symbol, symbol: Symbol, decimals: u32) {
        let key_init = symbol_short!("init");
        if env.storage().persistent().has(&key_init) {
            panic!("Already initialized");
        }

        env.storage().persistent().set(&symbol_short!("admin"), &admin);
        env.storage().persistent().set(&symbol_short!("name"), &name);
        env.storage().persistent().set(&symbol_short!("symbol"), &symbol);
        env.storage().persistent().set(&symbol_short!("decimals"), &decimals);
        env.storage().persistent().set(&symbol_short!("init"), &true);

        let empty_balances = Map::<Address, i128>::new(&env);
        env.storage().persistent().set(&symbol_short!("balances"), &empty_balances);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().persistent().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        let mut balances: Map<Address, i128> =
            env.storage().persistent().get(&symbol_short!("balances")).unwrap();
        let current = balances.get(to.clone()).unwrap_or(0);
        balances.set(to.clone(), (current + amount));
        env.storage().persistent().set(&symbol_short!("balances"), &balances);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let admin: Address = env.storage().persistent().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        let mut balances: Map<Address, i128> =
            env.storage().persistent().get(&symbol_short!("balances")).unwrap();
        let current = balances.get(from.clone()).unwrap_or(0);

        if current < amount {
            panic!("Insufficient balance");
        }

        balances.set(from.clone(), (current - amount));
        env.storage().persistent().set(&symbol_short!("balances"), &balances);
    }

    pub fn balance_of(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> =
            env.storage().persistent().get(&symbol_short!("balances")).unwrap();
        balances.get(user).unwrap_or(0)
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().persistent().get(&symbol_short!("decimals")).unwrap()
    }

    pub fn name(env: Env) -> Symbol {
        env.storage().persistent().get(&symbol_short!("name")).unwrap()
    }

    pub fn symbol(env: Env) -> Symbol {
        env.storage().persistent().get(&symbol_short!("symbol")).unwrap()
}
}