

const controller = {
    
    // Landing Page!
    home: async (req, res) => {
        try {
            res.render('home', {

            })
        }
        catch (err) {
            //console.log(err)
            res.sendStatus(400)
        }
    },

    // Login Page
    login: async (req, res) => {
        try {
            res.render('login', {

            })
        }
        catch (err) {
            //console.log(err)
            res.sendStatus(400)
        }
    },

    // Registration Page
    register: async(req, res) => {
        try {
            res.render('register', {

            })
        }
        catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
    },

   
    404: async(req, res) => {
        try {
            app.use((req, res, next) => {
                res.status(404).render('404', { title: 'Page Not Found' });
            });
        }
        catch (err) {
            console.log(err)

        }
    },


    
}

export default controller