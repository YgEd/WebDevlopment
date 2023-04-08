import {Router} from 'express';
// import { userData } from '../data/index.js';
import validation from '../validation.js';

const router = Router();

router.route('/').get(async (req, res) => {
    //code here for GET
    // const users = await userData.getAllUsers();
    res.render('authen/login', {Title: "DuckFit Login"});}
  );
router.route('/signup')


export default router;

