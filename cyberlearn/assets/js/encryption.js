(function() {
    'use strict';

    const CyberEncrypt = {
        SECRET_KEY: 'CyberLearn2025SecureKey',

        encrypt(text, key = this.SECRET_KEY) {
            if (!text) return '';
            
            let encrypted = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encrypted += String.fromCharCode(charCode);
            }
            
            return btoa(encrypted);
        },

        decrypt(encryptedText, key = this.SECRET_KEY) {
            if (!encryptedText) return '';
            
            try {
                const encrypted = atob(encryptedText);
                let decrypted = '';
                
                for (let i = 0; i < encrypted.length; i++) {
                    const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                    decrypted += String.fromCharCode(charCode);
                }
                
                return decrypted;
            } catch (error) {
                console.error('Decryption failed:', error);
                return '';
            }
        },

        hashPassword(password) {
            if (!password) return '';
            
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                hash = ((hash << 5) - hash) + password.charCodeAt(i);
                hash = hash & hash;
            }
            
            const hashStr = hash.toString(16) + password.length;
            return this.encrypt(hashStr);
        },

        encryptAccountData(account) {
            return {
                name: account.name,
                password: this.encrypt(account.password),
                email: account.email,
                createdAt: account.createdAt,
                encrypted: true
            };
        },

        decryptAccountData(account) {
            if (!account.encrypted) {
                return account;
            }
            
            return {
                name: account.name,
                password: this.decrypt(account.password),
                email: account.email,
                createdAt: account.createdAt,
                encrypted: false
            };
        },

        encryptAllAccounts() {
            try {
                const raw = localStorage.getItem('osafe_accounts');
                if (!raw) return { success: false, message: 'No accounts found' };
                
                const accounts = JSON.parse(raw);
                const encryptedAccounts = {};
                let count = 0;
                
                for (const [email, account] of Object.entries(accounts)) {
                    if (!account.encrypted) {
                        encryptedAccounts[email] = this.encryptAccountData(account);
                        count++;
                    } else {
                        encryptedAccounts[email] = account;
                    }
                }
                
                localStorage.setItem('osafe_accounts', JSON.stringify(encryptedAccounts));
                return { success: true, count, message: `Encrypted ${count} account(s)` };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        getEncryptionStats() {
            try {
                const raw = localStorage.getItem('osafe_accounts');
                if (!raw) return { total: 0, encrypted: 0, unencrypted: 0 };
                
                const accounts = JSON.parse(raw);
                const total = Object.keys(accounts).length;
                const encrypted = Object.values(accounts).filter(a => a.encrypted).length;
                
                return {
                    total,
                    encrypted,
                    unencrypted: total - encrypted,
                    percentage: total > 0 ? Math.round((encrypted / total) * 100) : 0
                };
            } catch (error) {
                return { total: 0, encrypted: 0, unencrypted: 0, percentage: 0 };
            }
        }
    };

    window.CyberEncrypt = CyberEncrypt;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const stats = CyberEncrypt.getEncryptionStats();
            if (stats.unencrypted > 0) {
                CyberEncrypt.encryptAllAccounts();
            }
        });
    } else {
        const stats = CyberEncrypt.getEncryptionStats();
        if (stats.unencrypted > 0) {
            CyberEncrypt.encryptAllAccounts();
        }
    }
})();
