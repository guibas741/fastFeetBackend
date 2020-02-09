import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblems from '../models/DeliveryProblems';

class DeliveryProblemsController {
  async index(req, res) {
    return res.json({ ola: 'enfermeira' });
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
