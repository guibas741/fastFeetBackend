import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      order: ['id'],
      attributes: [
        'id',
        'deliveryman_id',
        'recipient_id',
        'signature_id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });
    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      product,
      recipient_id,
      deliveryman_id,
      signature_id,
      start_date,
    } = req.body;

    const existsRecipient = await Recipient.findByPk(recipient_id);

    if (!existsRecipient) {
      return res.status(401).json({ error: 'Recipient does not exists' });
    }

    const existsDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!existsDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.create({
      product,
      recipient_id,
      deliveryman_id,
      signature_id,
      start_date,
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();
