import { Op } from 'sequelize';
import { isAfter, parseISO, startOfDay, endOfDay } from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliverymanPackagesController {
  async index(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'start_date', 'signature_id'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zip_code',
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async listEndedDeliveries(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      },
      attributes: ['id', 'product', 'start_date', 'signature_id'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async startDelivery(req, res) {
    const { id, delivery_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const start_date = parseISO(req.body.start_date);

    if (isAfter(start_date, new Date())) {
      return res
        .status(401)
        .json({ error: 'Start date cant be in the future' });
    }

    const validHour = !!(
      start_date.getHours() >= 8 && start_date.getHours() <= 18
    );

    if (!validHour) {
      return res.status(401).json({
        error: 'Deliveries can only start after 08:00 and before 18:00',
      });
    }

    const todaysDelivery = await Delivery.findAll({
      where: {
        end_date: null,
        deliveryman_id: id,
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
      },
    });

    if (todaysDelivery.length >= 5) {
      return res.status(400).json({
        error: 'Deliveryman cant have more than 5 deliveries per day',
      });
    }

    const updatedDelivery = await delivery.update({
      start_date,
    });

    return res.json(updatedDelivery);
  }

  async endDelivery(req, res) {
    const { id, delivery_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const end_date = parseISO(req.body.end_date);

    if (isAfter(end_date, new Date())) {
      return res.status(401).json({ error: 'End date cant be in the future' });
    }

    const { originalname: name, filename: path } = req.file;

    const signature = await File.create({
      name,
      path,
    });

    const updatedDelivery = await delivery.update({
      end_date,
      signature_id: signature.id,
    });

    return res.json(updatedDelivery);
  }
}

export default new DeliverymanPackagesController();
