import { Contribution } from '../models/Contribution';
import { Event } from '../models/Event';

export const getGiftsReceived = async (req, res) => {
  const { id } = req.params;

  try {
    const events = await Event.find({ host: id });

    const receivedGifts = await Promise.all(
      events.map(async (event) => {
        const contributions = await Contribution.find({
          event: event._id,
        }).populate('guest');
        const totalReceived = contributions.reduce(
          (sum, contribution) => sum + contribution.amount,
          0
        );

        return {
          eventId: event._id,
          eventName: event.name,
          totalReceived,
          contributions: contributions.map((contribution) => ({
            guestName: contribution.guest.name,
            amount: contribution.amount,
            paymentStatus: contribution.paymentStatus,
          })),
        };
      })
    );

    res.status(200).json({ gifts: receivedGifts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTopGuestsAndHosts = async (req, res) => {
  const { id } = req.params;

  try {
    const events = await Event.find({ host: id });
    let guestsMap = {};

    for (let event of events) {
      const contributions = await Contribution.find({
        event: event._id,
      }).populate('guest');
      contributions.forEach((contribution) => {
        if (!guestsMap[contribution.guest._id]) {
          guestsMap[contribution.guest._id] = {
            name: contribution.guest.name,
            totalReceived: 0,
            events: [], // Array to store event details
          };
        }
        guestsMap[contribution.guest._id].totalReceived += contribution.amount;
        guestsMap[contribution.guest._id].events.push({
          eventId: event._id,
          eventName: event.name,
          amountContributed: contribution.amount,
        });
      });
    }

    const topGuests = Object.values(guestsMap)
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, 5);

    res.status(200).json({ guests: topGuests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getGiftsContributed = async (req, res) => {
  const { id } = req.params;

  try {
    const contributions = await Contribution.find({ guest: id }).populate(
      'event'
    );

    const contributedGifts = contributions.reduce((result, contribution) => {
      const { event } = contribution;
      if (!result[event.host]) {
        result[event.host] = [];
      }
      result[event.host].push({
        eventId: event._id,
        eventName: event.name,
        amount: contribution.amount,
        paymentStatus: contribution.paymentStatus,
      });
      return result;
    }, {});

    res.status(200).json({ contribution: contributedGifts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
