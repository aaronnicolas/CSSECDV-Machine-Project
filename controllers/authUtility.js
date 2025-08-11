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
        const { email, password, confirm_password } = req.body;

        // Logging in: check required fields
        if (!email || !password) {
            return res.status(400).render('login', {
            error: 'Email and password are required!'
            });
        }

        // Register: check passwords
        if (confirm_password && password !== confirm_password) {
            return res.status(400).render('register', {
            error: 'Passwords do not match!'
            });
        }

        console.log('Attempting to Authenticate!');

        // Attach query feedback on failure
        const queryParams = new URLSearchParams({
            feedback: 'Incorrect username or password!'
        }).toString();

        // Correct passport usage with redirects
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: `/login?${queryParams}`,
            failureFlash: true,
        })(req, res, next);
    },


    logout: (req, res) => {
        // Basically just redirect to index
        req.logout((err) => {
            if (err) { return next(err) }
            res.redirect('/')
        })
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
    }
}

export default authUtility