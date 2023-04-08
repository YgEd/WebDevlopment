import {Router} from 'express';
import { userData } from '../data/index.js';
import validation from '../validation.js';

const router = Router();

router.route('/login').get(async (req, res) => {
    //code here for GET
    const users = await userData.getAllUsers();
    res.render('authen/login',{title: 'Login Page'})}
  );
router.route('/signup')


export default router;

