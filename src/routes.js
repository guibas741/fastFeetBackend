import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/users', async (req, res) => {
  const user = await User.create({
    name: 'Guibas',
    email: 'b@b.com',
    password: '123456',
  });
  res.json(user);
});

export default routes;
