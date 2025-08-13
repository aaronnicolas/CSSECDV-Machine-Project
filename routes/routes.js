import { Router } from "express"
import controller from "../controllers/controller.js"
import authUtility from "../controllers/authUtility.js"
import { requireAuth, requireRole, redirectIfAuthenticated } from "../middleware/auth.js"

const router = Router ()

// GETS
router.get (`/`,            controller.home)                    // PUBLIC
router.get (`/login`,       redirectIfAuthenticated, controller.login)        // PUBLIC + redirect if logged in
router.get (`/register`,    redirectIfAuthenticated, controller.register)     // PUBLIC + redirect if logged in  
router.get (`/info`,        controller.info)                    // PUBLIC
router.get (`/test`,        requireAuth, controller.test500)    // PROTECTED
router.get (`/star_admin`,  requireAuth, requireRole(2), controller.star_admin)     // ADMIN ONLY
router.get (`/star_sentinel`, requireAuth, requireRole(1), controller.star_sentinel) // MODERATOR+
router.get (`/user_dashboard`, requireAuth, controller.user_dashboard) // PROTECTED

// POSTS
router.post (`/login`,      authUtility.attemptAuth)            // PUBLIC
router.post (`/register`,   authUtility.register)               // PUBLIC
router.post (`/logout`,     requireAuth, authUtility.logout)    // ADD NEW

export default router