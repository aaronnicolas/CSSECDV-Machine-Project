const passwordValidator = {
    
    commonPasswords: [
        'password', 'password123', '123456', '123456789', 'qwerty', 
        'abc123', 'password1', 'admin', 'letmein', 'welcome',
        'monkey', '1234567890', 'dragon', 'master', 'shadow',
        'sunshine', 'football', 'iloveyou', 'princess', 'rockyou'
    ],

    validate: (password) => {
        const errors = [];
        
        if (!password) {
            errors.push('Password is required');
            return { isValid: false, errors };
        }

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password.length > 128) {
            errors.push('Password must be no more than 128 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
        }

        if (passwordValidator.commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a more secure password');
        }

        const hasRepeatingChars = /(.)\1{2,}/.test(password);
        if (hasRepeatingChars) {
            errors.push('Password cannot contain more than 2 consecutive identical characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    getStrengthScore: (password) => {
        if (!password) return 0;
        
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        if (password.length >= 16) score++;
        if (/[^A-Za-z0-9!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        return Math.min(score, 5);
    },

    getStrengthLevel: (password) => {
        const score = passwordValidator.getStrengthScore(password);
        
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Fair';
        if (score <= 4) return 'Good';
        return 'Strong';
    }
};

export default passwordValidator;