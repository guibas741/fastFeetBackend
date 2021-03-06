import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import FileController from './app/controllers/FileController';
import DeliverymanPackagesController from './app/controllers/DeliverymanPackagesController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

/* FUNCIONALIDADES DO ENTREGADOR QUE NAO ESTA CADASTRADO */
routes.get('/deliveryman/:id/deliveries', DeliverymanPackagesController.index);
routes.put(
  '/deliveryman/:id/deliveries/:delivery_id',
  DeliverymanPackagesController.startDelivery
);
routes.put(
  '/deliveryman/:id/deliveries/:delivery_id/end',
  upload.single('file'),
  DeliverymanPackagesController.endDelivery
);
routes.post(
  '/delivery/:delivery_id/problems',
  DeliveryProblemsController.store
);

/* FUNCIONALIDADES DO ADMINSTRADOR */
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

routes.get(
  '/deliveryman/:id/deliveriesEnded',
  DeliverymanPackagesController.listEndedDeliveries
);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.get('/deliveries/problems', DeliveryProblemsController.index);
routes.get(
  '/delivery/:delivery_id/problems',
  DeliveryProblemsController.listProblems
);
routes.delete(
  '/problem/:problem_id/cancel-delivery',
  DeliveryProblemsController.cancel
);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
