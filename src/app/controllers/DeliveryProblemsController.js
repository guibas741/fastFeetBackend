import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblems from '../models/DeliveryProblems';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveriesProblems = await DeliveryProblems.findAll({
      order: ['id'],
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliveriesProblems);
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
}

export default new DeliveryProblemsController();
