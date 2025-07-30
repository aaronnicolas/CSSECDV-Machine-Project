import bcrypt from 'bcrypt'
import passport from 'passport'

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

        // Validation: check required fields
        if (!email || !password) {
            return res.status(400).render('login', {
            error: 'Email and password are required!'
            });
        }

        // Optional: if you're registering, confirm_password might be needed
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
    }
}

export default authUtility