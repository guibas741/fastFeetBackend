import * as Yup from 'yup';
import { parseISO, isAfter } from 'date-fns';
import Delivery from '../models/Delivery';
import DeliveryProblems from '../models/DeliveryProblems';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveriesProblems = await DeliveryProblems.findAll({
      order: ['id'],
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliveriesProblems);
  }

  async listProblems(req, res) {
    const { page = 1 } = req.query;
    const { delivery_id } = req.params;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    const deliveryProblems = await DeliveryProblems.findOne({
      where: {
        delivery_id,
      },
      order: ['id'],
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id } = req.params;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    const { description } = req.body;

    const deliveryProblem = await DeliveryProblems.create({
      description,
      delivery_id,
    });

    return res.json(deliveryProblem);
  }

  async cancel(req, res) {
    const schema = Yup.object().shape({
      canceled_at: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { problem_id } = req.params;
    const problem = await DeliveryProblems.findByPk(problem_id);

    if (!problem) {
      return res.status(400).json({ error: 'Problem does not exists' });
    }

    const canceled_at = parseISO(req.body.canceled_at);

    if (isAfter(canceled_at, new Date())) {
      return res
        .status(401)
        .json({ error: 'Cancelled date cant be in the future' });
    }

    const delivery = await Delivery.findByPk(problem.delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (delivery.canceled_at !== null) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    const deliveryman = await Deliveryman.findByPk(delivery.deliveryman_id);

    const deliveryCanceled = await delivery.update({ canceled_at });

    await Queue.add(CancellationMail.key, {
      deliveryman,
      product: delivery.product,
      problem: problem.description,
    });

    return res.json(deliveryCanceled);
  }
}

export default new DeliveryProblemsController();
