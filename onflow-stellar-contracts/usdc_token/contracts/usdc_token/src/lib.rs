#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, Symbol, Map};

#[contract]
pub struct UsdcToken;

#[contractimpl]
impl UsdcToken {
    pub fn initialize(env: Env, admin: Address, name: Symbol, symbol: Symbol, decimals: u32) {
        let storage = env.storage().persistent();

        if storage.has(&symbol_short!("init")) {
            panic!("Already initialized");
        }

        storage.set(&symbol_short!("admin"), &admin);
        storage.set(&symbol_short!("name"), &name);
        storage.set(&symbol_short!("symbol"), &symbol);
        storage.set(&symbol_short!("decimals"), &decimals);
        storage.set(&symbol_short!("balances"), &Map::<Address, i128>::new(&env));
        storage.set(&symbol_short!("allows"), &Map::<(Address, Address), i128>::new(&env));
        storage.set(&symbol_short!("init"), &true);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let storage = env.storage().persistent();
        let admin: Address = storage.get::<Symbol, Address>(&symbol_short!("admin")).unwrap();
        admin.require_auth();

        let mut balances: Map<Address, i128> = storage.get::<Symbol, Map<Address, i128>>(&symbol_short!("balances")).unwrap();
        let balance = balances.get(to.clone()).unwrap_or(0);
        balances.set(to, balance + amount);
        storage.set(&symbol_short!("balances"), &balances);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let storage = env.storage().persistent();

        let mut balances: Map<Address, i128> = storage.get::<Symbol, Map<Address, i128>>(&symbol_short!("balances")).unwrap();
        let from_balance = balances.get(from.clone()).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        balances.set(from.clone(), from_balance - amount);
        let to_balance = balances.get(to.clone()).unwrap_or(0);
        balances.set(to, to_balance + amount);
        storage.set(&symbol_short!("balances"), &balances);
    }

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        let storage = env.storage().persistent();
        let mut allows: Map<(Address, Address), i128> = storage.get::<Symbol, Map<(Address, Address), i128>>(&symbol_short!("allows")).unwrap();
        allows.set((owner, spender), amount);
        storage.set(&symbol_short!("allows"), &allows);
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        let storage = env.storage().persistent();
        let mut balances: Map<Address, i128> = storage.get::<Symbol, Map<Address, i128>>(&symbol_short!("balances")).unwrap();
        let mut allows: Map<(Address, Address), i128> = storage.get::<Symbol, Map<(Address, Address), i128>>(&symbol_short!("allows")).unwrap();

        let allowance = allows.get((from.clone(), spender.clone())).unwrap_or(0);
        if allowance < amount {
            panic!("allowance too low");
        }
        let from_balance = balances.get(from.clone()).unwrap_or(0);
        if from_balance < amount {
            panic!("balance too low");
        }

        allows.set((from.clone(), spender.clone()), allowance - amount);
        balances.set(from.clone(), from_balance - amount);
        let to_balance = balances.get(to.clone()).unwrap_or(0);
        balances.set(to, to_balance + amount);

        storage.set(&symbol_short!("allows"), &allows);
        storage.set(&symbol_short!("balances"), &balances);
    }

    pub fn balance(env: Env, user: Address) -> i128 {
        let storage = env.storage().persistent();
        let balances: Map<Address, i128> = storage.get::<Symbol, Map<Address, i128>>(&symbol_short!("balances")).unwrap();
        balances.get(user).unwrap_or(0)
    }
}