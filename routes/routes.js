import { Router } from "express"
import controller from "../controllers/controller.js"
import authUtility from "../controllers/authUtility.js"
import { requireAuth, requireRole, redirectIfAuthenticated } from "../middleware/auth.js"
import bcrypt from 'bcrypt';
import { User } from "../model/userSchema.js"

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
router.get (`/changepassword`, requireAuth, controller.changepassword) // PROTECTED
router.get (`/securityquestion`, requireAuth, controller.securityquestion) // PROTECTED
router.get (`/user_profile`, requireAuth, controller.user_profile) // PROTECTED
router.get (`/galaxies`, requireAuth, controller.galaxies) // PROTECTED
router.get('/star_admin/analytics', requireRole(2), controller.analytics);

// POSTS
router.post (`/login`,      authUtility.attemptAuth)            // PUBLIC
router.post (`/register`,   authUtility.register)               // PUBLIC
router.get('/logout', requireAuth, authUtility.logout);

router.post('/securityquestion', requireAuth, async (req, res) => {
  const { securityAnswer1, securityAnswer2 } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.render('securityquestion', { error: 'User not found' });
    }

    const answer1Match = await bcrypt.compare(
      securityAnswer1.trim().toLowerCase(),
      user.securityAnswerHash1
    );
    const answer2Match = await bcrypt.compare(
      securityAnswer2.trim().toLowerCase(),
      user.securityAnswerHash2
    );

    if (!answer1Match || !answer2Match) {
      return res.render('securityquestion', { error: 'One or both security answers are incorrect' });
    }

    res.redirect('/changepassword');
  } catch (err) {
    console.error('Security verification error:', err);
    res.render('securityquestion', { error: 'An error occurred. Please try again.' });
  }
});

router.post (`/changepassword`,   authUtility.changePassword)  

export default router