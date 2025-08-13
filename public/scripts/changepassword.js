document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    const matchIndicator = document.getElementById('password-match-indicator');
    const matchText = document.getElementById('password-match-text');
    const registerBtn = document.getElementById('register-btn');

    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    // Common weak passwords
    const commonPasswords = [
        'password', 'password123', '123456', '123456789', 'qwerty', 
        'abc123', 'password1', 'admin', 'letmein', 'welcome',
        'monkey', '1234567890', 'dragon', 'master', 'shadow',
        'sunshine', 'football', 'iloveyou', 'princess', 'rockyou'
    ];

    // Password validation function
    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const isCommon = commonPasswords.includes(password.toLowerCase());
        const hasRepeating = /(.)\1{2,}/.test(password);

        return {
            requirements,
            isValid: Object.values(requirements).every(req => req) && !isCommon && !hasRepeating,
            isCommon,
            hasRepeating
        };
    }

    // Update password strength indicator
    function updatePasswordStrength(password) {
        if (!password) {
            strengthBar.style.width = '0%';
            strengthBar.className = 'progress-bar bg-danger';
            strengthText.textContent = 'Weak';
            return;
        }

        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        if (password.length >= 16) score++;
        
        // Penalize common patterns
        if (commonPasswords.includes(password.toLowerCase())) score = Math.max(0, score - 2);
        if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

        const maxScore = 5;
        const percentage = Math.min((score / maxScore) * 100, 100);
        
        strengthBar.style.width = percentage + '%';
        
        if (score <= 2) {
            strengthBar.className = 'progress-bar bg-danger';
            strengthText.textContent = 'Weak';
        } else if (score <= 3) {
            strengthBar.className = 'progress-bar bg-warning';
            strengthText.textContent = 'Fair';
        } else if (score <= 4) {
            strengthBar.className = 'progress-bar bg-info';
            strengthText.textContent = 'Good';
        } else {
            strengthBar.className = 'progress-bar bg-success';
            strengthText.textContent = 'Strong';
        }
    }

    // Update requirement indicators
    function updateRequirements(validation) {
        updateRequirement(reqLength, validation.requirements.length);
        updateRequirement(reqUpper, validation.requirements.upper);
        updateRequirement(reqLower, validation.requirements.lower);
        updateRequirement(reqNumber, validation.requirements.number);
        updateRequirement(reqSpecial, validation.requirements.special);
    }

    function updateRequirement(element, met) {
        const icon = element.querySelector('.req-icon');
        if (met) {
            icon.textContent = '✓';
            icon.className = 'req-icon text-success';
        } else {
            icon.textContent = '✗';
            icon.className = 'req-icon text-danger';
        }
    }

    // Check password match
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword === '') {
            matchIndicator.style.display = 'none';
            return true;
        }

        matchIndicator.style.display = 'block';
        
        if (password === confirmPassword) {
            matchText.textContent = 'Passwords match ✓';
            matchText.className = 'text-success';
            return true;
        } else {
            matchText.textContent = 'Passwords do not match ✗';
            matchText.className = 'text-danger';
            return false;
        }
    }

    // Update submit button state
    function updateSubmitButton() {
        const passwordValidation = validatePassword(passwordInput.value);
        const passwordsMatch = checkPasswordMatch();
        const allFieldsFilled = 
                                document.getElementById('username').value.trim() && 
                                document.getElementById('email').value.trim() && 
                                passwordInput.value && 
                                confirmPasswordInput.value && 
                                document.querySelector('[name="securityAnswer1"]').value.trim() &&
                                document.querySelector('[name="securityAnswer2"]').value.trim();

        if (passwordValidation.isValid && passwordsMatch && allFieldsFilled) {
            registerBtn.disabled = false;
            registerBtn.style.opacity = '1';
        } else {
            registerBtn.disabled = true;
            registerBtn.style.opacity = '0.6';
        }
    }

    // Password input event handler
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = validatePassword(password);
        
        updatePasswordStrength(password);
        updateRequirements(validation);
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Confirm password input event handler
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Other field change handlers
    document.getElementById('username').addEventListener('input', updateSubmitButton);
    document.getElementById('email').addEventListener('input', updateSubmitButton);

    // Form submission handler
    document.querySelector('form').addEventListener('submit', function(e) {
        const passwordValidation = validatePassword(passwordInput.value);
        const passwordsMatch = checkPasswordMatch();

        if (!passwordValidation.isValid) {
            e.preventDefault();
            
            let errorMessage = 'Password does not meet requirements:\n';
            if (!passwordValidation.requirements.length) errorMessage += '• Must be at least 8 characters long\n';
            if (!passwordValidation.requirements.upper) errorMessage += '• Must contain uppercase letter\n';
            if (!passwordValidation.requirements.lower) errorMessage += '• Must contain lowercase letter\n';
            if (!passwordValidation.requirements.number) errorMessage += '• Must contain number\n';
            if (!passwordValidation.requirements.special) errorMessage += '• Must contain special character\n';
            if (passwordValidation.isCommon) errorMessage += '• Password is too common\n';
            if (passwordValidation.hasRepeating) errorMessage += '• Cannot contain more than 2 consecutive identical characters\n';
            
            alert(errorMessage);
            return false;
        }

        if (!passwordsMatch) {
            e.preventDefault();
            alert('Passwords do not match!');
            return false;
        }
    });

    // Initial state
    updateSubmitButton();
});