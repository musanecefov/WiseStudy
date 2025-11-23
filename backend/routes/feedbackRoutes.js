import express from 'express';
import { createFeedback , listFeedback, resolveFeedback} from "../controllers/feedbackController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import adminOnly from "../middleware/admin.js"

const feedbackRoute = express.Router();

feedbackRoute.post("/",optionalAuth,upload.single("screenshot"),  createFeedback);


feedbackRoute.get('/',requireAuth,adminOnly,listFeedback);
feedbackRoute.patch('/:id/resolve', requireAuth,adminOnly, resolveFeedback);


export default feedbackRoute;
