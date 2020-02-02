import { Router } from 'express';

const routes = new Router();

routes.get('/users', (req, res) => {
  res.json({ message: "ola enfermeira"});
});

export default routes;