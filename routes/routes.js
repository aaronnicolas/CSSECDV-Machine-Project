import { Router } from "express"
import controller from "../controllers/controller.js"
import authUtility from "../controllers/authUtility.js"

const router = Router ()

// GETS
router.get (`/`,            controller.home)
router.get (`/login`,       controller.login)
router.get (`/register`,    controller.register)
router.get (`/info`,        controller.info)
router.get (`/test`,        controller.test500)
router.get (`/star_admin`,  controller.star_admin)
router.get (`/star_sentinel`, controller.star_sentinel)
router.get (`/user_dashboard`, controller.user_dashboard)

// POSTS
router.post (`/login`,      authUtility.attemptAuth)
router.post (`/register`,   authUtility.register)

export default router