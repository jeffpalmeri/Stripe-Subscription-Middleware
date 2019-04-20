require('dotenv').config();
const User = require('../models/user');
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require("stripe")(keySecret);
const mongoose = require('mongoose');

const middleware = {
  asyncErrorHandler: (fn) =>
    (req,res, next) => {
      Promise.resolve(fn(req, res, next))
             .catch(next);
    },

  isLoggedIn: (req, res, next) => {
    if(req.isAuthenticated()) return next();
    req.session.error = 'You need to be logged in to do that';
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  },

  isActiveSubscriber: async (req, res, next) => {
    await stripe.customers.retrieve(
      req.user.customer_id,
      function(err, customer) {
        // console.log(customer.id); // customer id
        // console.log(customer.subscriptions.data[0].id); //subscription id
        // console.log(customer.subscriptions.data[0].status); // subscription status
        //  stripe.subscriptions.update('sub_EsJXQevPIZyx86', {cancel_at_period_end: true});
        //  customer.subscriptions.data[0].cancel_at_period_end = true;
        // console.log(customer.subscriptions.data[0].cancel_at_period_end);
        if (customer == null) {
          res.redirect('/subscribe');
          return console.log(customer);
        } else if (customer.subscriptions.data[0] === undefined || customer.subscriptions.data[0] === undefined) {
          res.redirect('/subscribe');
          return console.log(customer.subscriptions);
        } else if (customer.subscriptions.data[0].status === 'active') return next();
          else {
            res.redirect('/');
            return console.log('There was an unexpected error');
          }
        }
      );
    }
  };

module.exports = middleware;