# OnFlow Stellar - DeFi Vault System

Bu proje, Stellar blockchain üzerinde Soroban smart contract'ları kullanarak geliştirilmiş kapsamlı bir DeFi (Decentralized Finance) sistemidir. Proje, USDC benzeri bir token ve gelişmiş bir vault sistemi içermektedir.

## 🏗️ Proje Yapısı

```
OnFlow Stellar-Hack Pera Rust-Soroban Smart Contracts/
├── usdc_token/                    # USDC benzeri token contract'ı
│   ├── contracts/
│   │   └── usdc_token/
│   │       ├── src/
│   │       │   ├── lib.rs         # Ana token implementasyonu
│   │       │   └── test.rs        # Test dosyaları
│   │       ├── Cargo.toml
│   │       └── Makefile
│   ├── Cargo.toml
│   └── README.md
│
└── vaultsystem+vaultsharetoken/   # Vault sistemi ve share token
    ├── contracts/
    │   ├── vault-system/          # Ana vault contract'ı
    │   │   ├── src/
    │   │   │   ├── vault.rs       # Vault ana mantığı
    │   │   │   ├── claim_calculator.rs  # Ödeme hesaplama
    │   │   │   ├── lib.rs
    │   │   │   └── test.rs
    │   │   ├── initialize.json    # Başlangıç parametreleri
    │   │   └── test_snapshots/    # Test verileri
    │   │
    │   └── vault-share-token/     # Vault share token contract'ı
    │       ├── src/
    │       │   ├── vault_share_token.rs  # Share token mantığı
    │       │   └── lib.rs
    │       └── initialize_share_token.json
    ├── deployment.md              # Deployment talimatları
    └── README.md
```

## 🏦 Vault Sistemi

### Vault Durumları
1. **Funding**: Fon toplama aşaması
2. **Funded**: Hedef tutara ulaşıldı
3. **Repayment**: Borç ödeme aşaması
4. **Claimable**: Ödemeler talep edilebilir
5. **Closed**: Vault kapatıldı

### Ana Özellikler
- **Durum Bazlı İşlem Kontrolü**: Her durumda farklı işlemler yapılabilir
- **Taksitli Ödeme Planı**: Esnek geri ödeme programı
- **Oranlı Dağıtım**: Yatırımcılara orantılı ödeme
- **Share Token Entegrasyonu**: Vault payı temsili token'ları

### Vault Fonksiyonları
- `initialize()`: Vault'u başlatır (admin, borrower, token, share_token, cap, taksit planı, funding_duration)
- `deposit()`: Fon yatırma (sadece Funding durumunda)
- `repay()`: Borç ödeme (sadece borrower)
- `claim()`: Ödeme talep etme
- `get_vault_info()`: Vault bilgilerini sorgular (durum, toplanan, geri ödenen)

## 🎫 Vault Share Token

### Özellikler
- **Vault Payı Temsili**: Her yatırımcının vault'taki payını temsil eder
- **Mint/Burn**: Vault sistemi tarafından otomatik yönetim

### Fonksiyonlar
- `initialize()`: Share token'ı başlatır
- `mint()`: Yeni pay oluşturur (vault sistemi)
- `burn()`: Pay yakma (vault sistemi)
- `balance_of()`: Kullanıcı payını sorgular
- `decimals()`: Token ondalık sayısını döndürür
- `name()`: Token adını döndürür
- `symbol()`: Token sembolünü döndürür

## 🪙 USDC Token Sistemi

### Özellikler
- **Stellar Token Standardı**: Soroban SDK ile uyumlu token fonksiyonları
- **Mint**: Admin tarafından token oluşturma
- **Transfer**: Kullanıcılar arası token transferi
- **Approve/TransferFrom**: Üçüncü taraf transfer yetkisi
- **Balance Tracking**: Kullanıcı bakiye takibi

### Fonksiyonlar
- `initialize()`: Token'ı başlatır (admin, isim, sembol, ondalık)
- `mint()`: Yeni token oluşturur (sadece admin)
- `transfer()`: Doğrudan transfer
- `approve()`: Transfer yetkisi verir
- `transfer_from()`: Yetki ile transfer
- `balance()`: Kullanıcı bakiyesini sorgular

## 🧮 Claim Calculator

### Ödeme Hesaplama Mantığı
```rust
claimable_amount = (user_deposit * total_repaid) / total_raised
```

Bu formül, her yatırımcının orantılı ödeme almasını sağlar:
- Kullanıcının yatırdığı miktar
- Toplam geri ödenen miktar
- Toplam toplanan miktar

## 🚀 Kullanım Senaryoları

### 1. Kredi Vault'u
- Borçlu bir proje için fon toplama
- Taksitli geri ödeme planı
- Yatırımcılara kar payı dağıtımı

### 2. Likidite Havuzu
- DeFi protokolleri için likidite sağlama
- Otomatik ödül dağıtımı
- Risk yönetimi

### 3. Crowdfunding
- Proje finansmanı
- Şeffaf fon yönetimi
- Adil dağıtım sistemi

## 🛠️ Teknik Detaylar

### Teknolojiler
- **Soroban SDK**: Stellar smart contract geliştirme
- **Rust**: Güvenli ve performanslı programlama dili
- **Stellar Blockchain**: Hızlı ve düşük maliyetli işlemler

### Güvenlik Özellikleri
- **Yetkilendirme**: Admin ve borrower kontrolleri
- **Durum Kontrolü**: Vault durumuna göre işlem kısıtlamaları
- **Bakiye Kontrolü**: Yetersiz bakiye durumunda işlem reddi
- **Çift Sayım Koruması**: Claim işlemlerinde tekrar ödeme engeli (claimed_map ile takip)

## 📋 Deployment

### Gereksinimler
- Rust ve Cargo
- Soroban CLI
- Stellar testnet/mainnet hesabı

### Adımlar
1. **Contract Build**: `cargo build --target wasm32-unknown-unknown --release`
2. **Deploy**: `stellar contract deploy`
3. **Initialize**: Contract'ları başlat
4. **Test**: Test senaryolarını çalıştır

Detaylı deployment talimatları için `vaultsystem+vaultsharetoken/deployment.md` dosyasına bakın.

## 🧪 Test

```bash
# USDC Token testleri
cd usdc_token
cargo test

# Vault System testleri
cd vaultsystem+vaultsharetoken
cargo test
```

## 📄 Lisans

MIT License - Açık kaynak proje

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Proje hakkında sorularınız için GitHub Issues kullanabilirsiniz.

---

**Not**: Bu proje Stellar Hackathon için geliştirilmiştir ve DeFi ekosisteminde yenilikçi çözümler sunmayı amaçlamaktadır. 