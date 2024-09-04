import { Contribution } from '../models/Contribution';
import { Event } from '../models/Event';
import { User } from '../models/User';

export const createEvent = async (req, res) => {
  const { name, date, venue, hostId } = req.body;

  try {
    if (!name || !date || !venue || !hostId) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    const newEvent = new Event({
      name: name,
      date: date,
      venue: venue,
      host: hostId,
      guests: [],
    });

    const savedEvent = await newEvent.save();

    return res
      .status(201)
      .json({ message: 'Event created successful', event: savedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const eventList = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {};
    if (id) {
      query.host = id;
    }

    const events = await Event.find(query).populate('host').populate('guests');

    res.status(200).json({ events: events });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addContribution = async (req, res) => {
  const { eventId, userId, amount } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let contribution = await Contribution.findOne({
      event: eventId,
      guest: userId,
    });

    if (contribution) {
      contribution.amount = amount;
      contribution.paymentStatus = 'Completed';
      await contribution.save();
    } else {
      contribution = new Contribution({
        event: eventId,
        guest: userId,
        amount: amount,
        paymentStatus: 'Completed',
      });
      await contribution.save();

      if (!event.guests.includes(userId)) {
        event.guests.push(userId);
      }
    }

    event.totalReceivedAmount = event.totalReceivedAmount
      ? event.totalReceivedAmount + amount
      : amount;

    await event.save();
    res.status(200).json({ message: 'Added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserInvitations = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const events = await Event.find({ guests: id });

    if (events.length === 0) {
      return res.status(404).json({ invites: [] });
    }

    const invitations = await Promise.all(
      events.map(async (event) => {
        const contribution = await Contribution.findOne({
          event: event._id,
          guest: id,
        });

        return {
          event: event,
          contribution: contribution,
        };
      })
    );

    res.status(200).json({ invites: invitations });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['Open', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Allowed values are "Open" or "Closed".',
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event: event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const eventDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate('host').populate('guests');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const contributions = await Contribution.find({ event: id });

    const guestsWithPaymentStatus = event.guests.map((guest) => {
      const guestContribution = contributions.find(
        (contribution) => contribution.guest.toString() === guest._id.toString()
      );

      return {
        ...guest._doc,
        paymentStatus: guestContribution
          ? guestContribution.paymentStatus
          : 'Pending',
        contributionAmount: guestContribution ? guestContribution.amount : 0,
      };
    });

    res.status(200).json({
      event: { ...event._doc, guests: guestsWithPaymentStatus },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createGuest = async (req, res) => {
  const { eid } = req.params;
  const { id, phone, email, name, city, fee } = req.body;

  try {
    const event = await Event.findById(eid);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let user;
    if (id) {
      user = await User.findById(id);
    } else {
      if (!user) {
        user = new User({
          phone: phone,
          email: email,
          name: name,
          city: city,
          password: '123456',
        });
        await user.save();
      }
    }

    const isAlreadyGuest = event.guests.some(
      (guest) => guest.toString() === user._id.toString()
    );

    if (!isAlreadyGuest) {
      event.guests.push(user._id);
    }

    if (fee !== 0) {
      const newContribution = new Contribution({
        event: event._id,
        guest: user._id,
        amount: fee,
      });

      await newContribution.save();
    }

    await event.save();

    res.status(200).json({ message: 'Guest added successfully', event: event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
