

const controller = {
    
    // Landing Page!
    home: async (req, res) => {
        try {
            res.render('home', {
                user: req.user || null
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
                error: req.query.feedback,
                success: req.query.message && !req.query.feedback ? req.query.message : null
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
                ],
                user: req.user
                }
            )
        }
        catch (err) {
            next(err)
        }
    },

    star_sentinel: async(req, res, next) => {
        try {
            res.render('star_sentinel', {
                layout: 'admin',
                moderatorName: 'Luna Stern',
                widgets: [
                    {
                    title: '🔭 My Observations',
                    description: 'Track and manage your own observation logs.',
                    labels: ['Jan', 'Feb', 'Mar'],
                    data: [2, 5, 3]
                    },
                    {
                    title: '👥 User Moderation',
                    description: 'Review and take action on flagged users.',
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    data: [3, 5, 1, 2, 4]
                    },
                    {
                    title: '🔍 Observation Review',
                    description: 'Approve, reject, or edit incoming observation reports.',
                    labels: ['Week 1', 'Week 2', 'Week 3'],
                    data: [10, 15, 8]
                    }
                ],
                user: req.user
            })
        }
        catch (err) {
            next(err)
        }
    },

    user_dashboard: async(req, res, next) => {
        try {
            res.render('user_dashboard', {
                layout: 'admin',
                userName: 'Nova Skye',
                widgets: [
                    {
                    title: '🔭My Observations',
                    description: 'Track and manage your own observation logs.',
                    labels: ['Jan', 'Feb', 'Mar'],
                    data: [2, 5, 3]
                    },
                    {
                    title: '✨Profile Activity',
                    description: 'View recent updates to your account.',
                    labels: ['Week 1', 'Week 2', 'Week 3'],
                    data: [1, 2, 2]
                    }
                ],
                user: req.user
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