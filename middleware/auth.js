import logEvent from "../utils/logger.js";
// Authentication middleware to require login

const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login?feedback=Please log in to access this page');
};

// Middleware to require specific role level
const requireRole = (minRole) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            logEvent({ event: 'Access Denied', desc: 'Insufficient permissions', user: null });

            return res.redirect('/login?feedback=Please log in to access this page');
        }
        
        if (req.user.role < minRole) {
            return res.status(403).render('404', {
                title: "Access Denied",
                layout: "error",
            });
        }
        
        next();
    };
};

// Redirect authenticated users away from login/register
const redirectIfAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
};

export { requireAuth, requireRole, redirectIfAuthenticated };