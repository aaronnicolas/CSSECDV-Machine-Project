

const controller = {
    
    // Landing Page!
    home: async (req, res) => {
        try {
            res.render('home', {

            })
        }
        catch (err) {
            next(err)
        }
    },

    // Login Page
    login: async (req, res) => {
        try {
            res.render('login', {

            })
        }
        catch (err) {
            next(err)
        }
    },

    // Registration Page
    register: async(req, res) => {
        try {
            res.render('register', {

            })
        }
        catch (err) {
            next(err)
        }
    },

    // Info Page
    info: async(req, res) => {
        try {
            res.render ('info', {

            })
        }
        catch (err) {
            next(err)
        }
    },

   
    test500: async(req, res, next) => {
        try {
            next(new Error('Something broke!'))
        }
        catch (err) {
            next(err)
        }
    },


    
}

export default controller