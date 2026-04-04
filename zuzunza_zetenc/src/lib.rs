//! ZetEnc — compatible with [wscp-library zetenc](https://github.com/zuzunza-com/wscp-library) Go implementation.
//! Magic prefix `ZET` is stripped before calling [`decrypt`].

use aes::cipher::{AsyncStreamCipher, KeyIvInit};
use aes::Aes256;
use cfb_mode::{Decryptor as CfbDecryptor, Encryptor as CfbEncryptor};
use sha2::{Digest, Sha256};
use thiserror::Error;

type Aes256CfbDec = CfbDecryptor<Aes256>;
type Aes256CfbEnc = CfbEncryptor<Aes256>;

/// Magic bytes prepended to ciphertext (same as Go `zetEncMagicHeader`).
pub const ZETENC_MAGIC: &[u8] = b"ZET";

#[derive(Debug, Error)]
pub enum ZetEncError {
    #[error("ZetEnc decrypt failed: {0}")]
    Crypto(String),
}

/// Match Go `generateKey`: `fmt.Sprintf("%f%s", radius, seed)` (`%f` default precision 6) then SHA256.
fn generate_key(radius: f64, seed: &str) -> [u8; 32] {
    let combined = format!("{:.6}{}", radius, seed);
    let hash = Sha256::digest(combined.as_bytes());
    hash.into()
}

/// Match Go `generateIV`: angle = radius * PI / 180, `fmt.Sprintf("%f%s", angle, seed)`, SHA256, first 16 bytes.
fn generate_iv(radius: f64, seed: &str) -> [u8; 16] {
    let angle = radius * std::f64::consts::PI / 180.0;
    let combined = format!("{:.6}{}", angle, seed);
    let hash = Sha256::digest(combined.as_bytes());
    let mut iv = [0u8; 16];
    iv.copy_from_slice(&hash[..16]);
    iv
}

/// Decrypt ZetEnc payload (without `ZET` prefix), matching Go `Decrypt`.
pub fn decrypt(ciphertext: &[u8], radius: f64, seed: &str) -> Result<Vec<u8>, ZetEncError> {
    let key = generate_key(radius, seed);
    let iv = generate_iv(radius, seed);
    let mut buf = ciphertext.to_vec();
    let mut dec = Aes256CfbDec::new(&key.into(), &iv.into());
    dec.decrypt(&mut buf);
    Ok(buf)
}

/// If `data` starts with [`ZETENC_MAGIC`], decrypt the remainder; otherwise return a copy of `data`.
pub fn decrypt_if_zet(data: &[u8], radius: f64, seed: &str) -> Result<Vec<u8>, ZetEncError> {
    if data.len() >= ZETENC_MAGIC.len() && &data[..ZETENC_MAGIC.len()] == ZETENC_MAGIC {
        decrypt(&data[ZETENC_MAGIC.len()..], radius, seed)
    } else {
        Ok(data.to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip_aes_cfb() {
        let radius = 45.0_f64;
        let seed = "game-proxy-seed-2026";
        let plain = b"hello zetenc";
        let key = generate_key(radius, seed);
        let iv = generate_iv(radius, seed);
        let mut ct = plain.to_vec();
        let mut enc = Aes256CfbEnc::new(&key.into(), &iv.into());
        enc.encrypt(&mut ct);
        let dec = decrypt(&ct, radius, seed).expect("decrypt");
        assert_eq!(dec.as_slice(), plain.as_slice());
    }
}
