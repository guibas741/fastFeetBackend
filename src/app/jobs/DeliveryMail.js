import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda',
      template: 'delivery',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        street: recipient.street,
        number: recipient.number,
        city: recipient.city,
        product,
      },
    });
  }
}

export default new DeliveryMail();
