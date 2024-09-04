import express from 'express';

import {
  addContribution,
  changeName,
  changeStatus,
  createEvent,
  createGuest,
  eventDetail,
  eventList,
  getGiftsContributed,
  getGiftsReceived,
  getTopGuestsAndHosts,
  getUserInvitations,
  indexPage,
  userDetail,
} from '../controllers';
import { auth } from '../controllers';

const indexRouter = express.Router();

indexRouter.get('/', indexPage);

indexRouter.post('/auth', auth);
indexRouter.patch('/auth/name', changeName);
indexRouter.post('/user/find', userDetail);

indexRouter.post('/event/create', createEvent);
indexRouter.get('/events/:id', eventList);
indexRouter.get('/event/:id', eventDetail);
indexRouter.post('/guest/event/:eid', createGuest);
indexRouter.put('/status/event/:id', changeStatus);
indexRouter.get('/invite/event/:id', getUserInvitations);
indexRouter.post('/contribute/event', addContribution);

indexRouter.get('/gift/received/:id', getGiftsReceived);
indexRouter.get('/host/guest/:id', getTopGuestsAndHosts);
indexRouter.get('/contribution/gift/:id', getGiftsContributed);

export default indexRouter;
