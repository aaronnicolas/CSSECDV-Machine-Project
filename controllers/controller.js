

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

    star_admin: async(req, res) => {
        try {
            res.render('star_admin',
                {
                    layout: 'admin',
                    adminName: 'Ice Martinez',
                    widgets: [
                    {
                    title: 'User Management',
                    description: 'Add, edit, or remove users from the star system.',
                    total: '1,024 users', 
                    growth: 8,
                    link: '/admin/users',
                    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                    data: [120, 135, 150, 140, 160, 175, 190] // chart data
                    },
                    {
                    title: 'Observations Overview',
                    description: 'Review and moderate other observation logs from Moderators and Regulars',
                    total: '312 observations', 
                    growth: -3, 
                    link: '/admin/observations',
                    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                    data: [45, 40, 38, 35, 50, 47, 57]
                    },
                    {
                    title: 'Analytics', 
                    description: 'View site traffic and trends.',
                    total: '12.3k visits',
                    growth: 15,
                    link: '/admin/analytics',
                    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                    data: [1800, 2100, 1950, 2200, 2500, 2700, 3100]
                    }
                ]
                }
            )
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