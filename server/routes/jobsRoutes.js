import express from 'express';
import { authorizeJob, runJobs } from '../controllers/jobsController.js';

const router = express.Router();


router.use(authorizeJob);


router.route('/run').get(runJobs).post(runJobs);

export default router;

