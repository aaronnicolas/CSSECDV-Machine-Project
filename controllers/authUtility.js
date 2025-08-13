import bcrypt from 'bcrypt'
import passport from 'passport'
import passwordValidator from '../utils/passwordValidator.js'
import { User } from '../model/userSchema.js'

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
                user.failedLoginAttempts += 1;

                if (user.failedLoginAttempts >= 5) {
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
        await userObj.save();

        req.logIn(userObj, (err) => {
            if (err) { return next(err); }
            res.redirect('/');
        });

        })(req, res, next);
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
            const { username, email, password, confirm_password } = req.body;

            // Check required fields
            if (!username || !email || !password) {
                return res.status(400).render('register', {
                    error: 'All fields are required!'
                });
            }

            // Check password confirmation
            if (confirm_password && password !== confirm_password) {
                return res.status(400).render('register', {
                    error: 'Passwords do not match!'
                });
            }

            // Validate password complexity
            const passwordValidation = passwordValidator.validate(password);
            if (!passwordValidation.isValid) {
                return res.status(400).render('register', {
                    error: passwordValidation.errors.join(', ')
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }] 
            });
            
            if (existingUser) {
                return res.status(400).render('register', {
                    error: 'Username or email already exists!'
                });
            }

            // Generate salt and hash password
            const saltRounds = 12;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                salt,
                role: 0,
                locked: 0
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

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) { 
                console.error('Logout error:', err);
                return next(err); 
            }
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return next(err);
                }
                res.redirect('/?message=Successfully logged out');
            });
        });
    }
}

export default authUtility