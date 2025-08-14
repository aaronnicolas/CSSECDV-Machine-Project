import bcrypt from 'bcrypt'
import passport from 'passport'
import passwordValidator from '../utils/passwordValidator.js'
import { User } from '../model/userSchema.js'
import logEvent from '../utils/logger.js'

// Helper function to record login attempt (current attempt only)
async function recordLoginAttempt(user, successful, req) {
    // Parse device information
    const deviceInfo = parseDeviceInfo(req.get('User-Agent'));

    // Record new attempt (data moving is handled separately)
    user.lastLoginAttempt = {
        timestamp: new Date(),
        successful: successful,
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        userAgent: (req.get('User-Agent') || 'Unknown').substring(0, 200),
        deviceInfo: deviceInfo
    };

    await logEvent({event:`Login Attempt ${user.lastLoginAttempt.timestamp}`, 
                    desc: JSON.stringify(user.lastLoginAttempt),
                    user: user}
                    // auto generate id through mongoose  
                )

    await user.save();
}

// Generate last login message
function generateLastLoginMessage(user) {
    if (!user.previousLoginAttempt || !user.previousLoginAttempt.timestamp) {
        return "Welcome! This is your first login to our system.";
    }

    const lastAttempt = user.previousLoginAttempt;
    const timeAgo = formatTimeAgo(lastAttempt.timestamp);
    const status = lastAttempt.successful ? 'successful' : 'failed';
    
    // Build device description
    let deviceDesc = 'unknown device';
    if (lastAttempt.deviceInfo) {
        const { browser, os, deviceType } = lastAttempt.deviceInfo;
        deviceDesc = `${browser} on ${os}`;
        if (deviceType) {
            deviceDesc += ` (${deviceType})`;
        }
    }
    
    const cleanIP = cleanIPAddress(lastAttempt.ipAddress);
    return `Last login attempt: ${status} ${timeAgo} from ${deviceDesc} - IP ${cleanIP}`;
}

// Format time difference in human readable format
function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}

// Clean up IP address display format
function cleanIPAddress(ipAddress) {
    if (!ipAddress || ipAddress === 'Unknown') {
        return 'Unknown';
    }
    
    // Handle IPv6-mapped IPv4 addresses (::ffff:x.x.x.x)
    if (ipAddress.startsWith('::ffff:')) {
        const ipv4Part = ipAddress.substring(7); // Remove "::ffff:" prefix
        // Validate it's actually an IPv4 address
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ipv4Part)) {
            return ipv4Part;
        }
    }
    
    // Handle localhost variations
    if (ipAddress === '::1') {
        return 'localhost (IPv6)';
    }
    
    // Return original IP for actual IPv6 addresses and regular IPv4
    return ipAddress;
}

// Parse device information from user agent string
function parseDeviceInfo(userAgent) {
    if (!userAgent) {
        return {
            browser: 'Unknown Browser',
            os: 'Unknown OS',
            deviceType: 'Desktop',
            isMobile: false
        };
    }

    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let deviceType = 'Desktop';
    let isMobile = false;

    // Parse browser
    if (userAgent.includes('Chrome/')) {
        const chromeVersion = userAgent.match(/Chrome\/([\d.]+)/);
        browser = chromeVersion ? `Chrome ${chromeVersion[1].split('.')[0]}` : 'Chrome';
    } else if (userAgent.includes('Firefox/')) {
        const firefoxVersion = userAgent.match(/Firefox\/([\d.]+)/);
        browser = firefoxVersion ? `Firefox ${firefoxVersion[1]}` : 'Firefox';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
        const safariVersion = userAgent.match(/Version\/([\d.]+)/);
        browser = safariVersion ? `Safari ${safariVersion[1]}` : 'Safari';
    } else if (userAgent.includes('Edge/')) {
        const edgeVersion = userAgent.match(/Edge\/([\d.]+)/);
        browser = edgeVersion ? `Edge ${edgeVersion[1]}` : 'Edge';
    }

    // Parse OS
    if (userAgent.includes('Windows NT')) {
        const winVersion = userAgent.match(/Windows NT ([\d.]+)/);
        if (winVersion) {
            const version = winVersion[1];
            if (version === '10.0') os = 'Windows 10';
            else if (version === '6.3') os = 'Windows 8.1';
            else if (version === '6.1') os = 'Windows 7';
            else os = `Windows ${version}`;
        } else {
            os = 'Windows';
        }
    } else if (userAgent.includes('Mac OS X')) {
        const macVersion = userAgent.match(/Mac OS X ([\d_]+)/);
        os = macVersion ? `macOS ${macVersion[1].replace(/_/g, '.')}` : 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        const androidVersion = userAgent.match(/Android ([\d.]+)/);
        os = androidVersion ? `Android ${androidVersion[1]}` : 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        const iosVersion = userAgent.match(/OS ([\d_]+)/);
        os = iosVersion ? `iOS ${iosVersion[1].replace(/_/g, '.')}` : 'iOS';
    }

    // Detect device type
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
        deviceType = 'Mobile';
        isMobile = true;
    } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
        deviceType = 'Tablet';
        isMobile = true;
    } else {
        deviceType = 'Desktop';
        isMobile = false;
    }

    return {
        browser: browser,
        os: os,
        deviceType: deviceType,
        isMobile: isMobile
    };
}

// Helper function to move current attempt to previous
function moveCurrentAttemptToPrevious(user) {
    if (user.lastLoginAttempt) {
        user.previousLoginAttempt = {
            timestamp: user.lastLoginAttempt.timestamp,
            successful: user.lastLoginAttempt.successful,
            ipAddress: user.lastLoginAttempt.ipAddress,
            userAgent: user.lastLoginAttempt.userAgent,
            deviceInfo: user.lastLoginAttempt.deviceInfo
        };
    }
}

const authUtility = {

    getLogin: (req, res) => {
        // this function should be designed for
        // opening the login page or somethign i forget
        // basically if the session is already happening or something
        // i forgettttt
        try {
            
        }
        catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    },

    attemptAuth: async (req, res, next) => {
    try {
    const { username, password, confirm_password } = req.body;

    if (!username || !password) {
        return res.status(400).render('login', {
            error: 'Invalid username and/or password'
        });
    }

    // Fetch user to check lock state
    const user = await User.findOne({ username });
    if (user) {
        const now = new Date();

        // Check if locked
        if (user.locked && user.lockedUntil && now < user.lockedUntil) {
            const waitMinutes = Math.ceil((user.lockedUntil - now) / 60000);
            return res.status(403).render('login', {
                error: `Account locked. Try again in ${waitMinutes} minute(s).`
            });
        }
    }

    // Use passport for authentication
    passport.authenticate('local', async (err, userObj, info) => {
        if (err) { return next(err); }

        if (!userObj) {
            // Failed attempt
            if (user) {
                // Move current to previous before recording failed attempt
                moveCurrentAttemptToPrevious(user);
                
                // Record failed login attempt
                await recordLoginAttempt(user, false, req);
                
                user.failedLoginAttempts += 1;

                if (user.failedLoginAttempts >= 5) {
                    // log the max attempts and locking
                    await logEvent({
                        event: `MAX LOGIN LOCK ${Date.now()}`, 
                        desc: JSON.stringify(user.lastLoginAttempt),
                        user: user
                    })
                    user.locked = true;
                    user.lockedUntil = new Date(Date.now() + 15 * 60000); // 15 minutes lock
                }
                await user.save();
            }

            return res.redirect(`/login?feedback=Invalid username and/or password`);
        }

        // Successful login
        userObj.failedLoginAttempts = 0;
        userObj.locked = false;
        userObj.lockedUntil = null;
        
        // Move current attempt to previous BEFORE generating message
        moveCurrentAttemptToPrevious(userObj);
        
        // Generate last login message with correctly updated data
        const lastLoginMessage = generateLastLoginMessage(userObj);
        
        // Record this successful login attempt
        await recordLoginAttempt(userObj, true, req);

        req.logIn(userObj, (err) => {
            if (err) { return next(err); }
            res.redirect(`/?lastLoginMessage=${encodeURIComponent(lastLoginMessage)}`);
        });

        })(req, res, next);
        }
        catch (err) {
            next(err)
        }
    },

    getRegister: async (req, res) => {
        // If I'm remembering this correctly, basically
        // Check if the user is authenticated when opening the page
        // If they are, just go to index page?
        // I forgot what the others are supposed to be  
        if (req.isAuthenticated()) {
            res.redirect('/')
        }
        else {
            if (req.query) {
                res.render ('register', {
                    layout: 'logregTemplate',
                    message: req.query.message
                })
            }
            else {
                res.render('register', {layout: 'logregTemplate'})
            }
        }
    },

    register: async (req, res) => {
    try {
        const { username, email, password, confirm_password, securityAnswer1, securityAnswer2 } = req.body;

        // Check required fields
        if (!username || !email || !password || !securityAnswer1 || !securityAnswer2) {

            await logEvent({event:`Incomplete Fields ${Date.now()}`, 
                desc: `${username} ${email} Registration failed`,
                user: null}
                // auto generate id through mongoose  
            )

            return res.status(400).render('register', {
                error: 'All fields are required!'
            });
        }

        // Check password confirmation
        if (confirm_password && password !== confirm_password) {
            await logEvent({event:`Passwords do not match ${Date.now()}`, 
                desc: `${username} ${email} attempt registration, failed`,
                user: null}
                // auto generate id through mongoose  
            )

            return res.status(400).render('register', {
                error: 'Passwords do not match!'
            });
        }

        // Validate password complexity
        const passwordValidation = passwordValidator.validate(password);
        if (!passwordValidation.isValid) {
            await logEvent({event:`Password not complex enough ${Date.now()}`, 
                desc: `${username} ${email} attempt registration, failed`,
                user: null}
                // auto generate id through mongoose  
            )

            return res.status(400).render('register', {
                error: passwordValidation.errors.join(', ')
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            await logEvent({event:`User already exists ${Date.now()}`, 
                desc: `${username} ${email} attempt registration, failed`,
                user: null}
                // auto generate id through mongoose  
            )

            return res.status(400).render('register', {
                error: 'Username or email already exists!'
            });
        }

        // Generate salt and hash password
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Hash security answers (case-insensitive matching)
        const securityAnswerHash1 = await bcrypt.hash(securityAnswer1.trim().toLowerCase(), 10);
        const securityAnswerHash2 = await bcrypt.hash(securityAnswer2.trim().toLowerCase(), 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            passwordChangedAt: new Date(),
            salt,
            role: 0,
            locked: 0,
            securityQuestion1: 'What is your favorite game?',
            securityAnswerHash1,
            securityQuestion2: 'What is your favorite color?',
            securityAnswerHash2
        });

        await newUser.save();

        // Redirect to login with success message
        const queryParams = new URLSearchParams({
            message: 'Registration successful! Please log in.'
        }).toString();
        
        res.redirect(`/login?${queryParams}`);

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).render('register', {
            error: 'An error occurred during registration. Please try again.'
        });
    }
    },

    changePassword: async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // Check if all fields are filled
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).render('changepassword', {
                error: 'All fields are required!'
            });
        }

        // Get logged in user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).render('changepassword', {
                error: 'User not found.'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).render('changepassword', {
                error: 'Current password is incorrect.'
            });
        }

        // Check password age requirement (must be at least 1 day old)
        if (user.passwordChangedAt) {
            const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const passwordAge = Date.now() - user.passwordChangedAt.getTime();
            
            if (passwordAge < oneDayInMs) {
                const hoursLeft = Math.ceil((oneDayInMs - passwordAge) / (60 * 60 * 1000));
                return res.status(400).render('changepassword', {
                    error: `Password can only be changed once every 24 hours. Please wait ${hoursLeft} more hours before changing your password again.`
                });
            }
        }

        // Check if new password matches confirmation
        if (newPassword !== confirmNewPassword) {
            return res.status(400).render('changepassword', {
                error: 'New passwords do not match.'
            });
        }

        // Ensure new password is not the same as the current one
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).render('changepassword', {
                error: 'New password cannot be the same as the current password.'
            });
        }

        // Ensure new password is not the same as previous password
        if (user.previousPasswordHash && await bcrypt.compare(newPassword, user.previousPasswordHash)) {
            return res.status(400).render('changepassword', {
                error: 'New password cannot be the same as the previous password.'
            });
        }

        // Save old password as previous
        user.previousPasswordHash = user.password;

        // Hash new password
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        user.password = await bcrypt.hash(newPassword, salt);

        // Update password changed timestamp
        user.passwordChangedAt = new Date();

        await user.save();

        res.redirect(`/logout`)

    } catch (err) {
        console.error('Change password error:', err);
        // However, I won't use the middleware here because it calls a different handlebar
        res.status(500).render('changepassword', {
            error: 'An error occurred while changing password. Please try again.'
        });
    }
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) { 
                //console.error('Logout error:', err);
                // I'm commenting out these errors, because it should pass 
                // to the middleware that redirects users to generic 500 page?
                return next(err); 
            }
            req.session.destroy((err) => {
                if (err) {
                    //console.error('Session destroy error:', err);
                    return next(err);
                }
                res.redirect('/?message=Successfully logged out');
            });
        });
    }
}

export default authUtility