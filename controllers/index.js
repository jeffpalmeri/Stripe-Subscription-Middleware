const User = require('../models/user');
const util = require('util');
const crypto = require('crypto');
const passport = require('passport');
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require("stripe")(keySecret);
const stripeSubscriptionPlan = process.env.STRIPE_SUBSCRIPTION_PLAN;

module.exports = {
  // Get /
  async landingPage(req, res, next) {
    // const posts = await Post.find({});
    res.render('index', { title: 'Home' });
  },

  // GET register
  getRegister(req, res, next) {
    res.render('register', { title: 'Register', username: '', email: ''});
  },

  // Post register
  async postRegister(req, res, next) {
    try {
      const user = await User.register(new User(req.body), req.body.password);
      req.login(user, function(err) {
        if(err) return next(err);
        req.session.success = `Welcome to Surf Shop, ${user.username}!`;
        res.redirect('/subscribe');
      });
    } catch (err) {
      const { username, email } = req.body;
      let error = err.message;
      if(error.includes('dup') && error.includes('email_1 dup key')) {
        error = 'A user with the given email is already registered';
      }
      res.render('register', { title: 'Register', username, email, error});
    }
  },

  // GET /login
  getLogin(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/');
    if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
    res.render('login', { title: 'Login'});
  },

  // POST login
  async postLogin(req, res, next) {
    const { username, password } = req.body;
    const { user, error } = await User.authenticate()(username, password);
    if(!user && error) { 
      return next(error);
    }
    req.login(user, function(err) {
      if(err) return next(err);
      req.session.success = `Welcome back, ${username}!`;
      const redirectUrl = req.session.redirectTo || '/';
      delete req.session.redirectTo;
      res.redirect(redirectUrl);
    });
  },

  getLogout(req, res, next) {
    req.logout();
    res.redirect('/');
  },

  getSecret(req, res, next) {
    res.render('secret');
  },

  getSubscribe(req, res, next) {
    res.render('subscribe');
  },

  async postSubscribe(req, res, next) {
    let amount = 1000;

    await stripe.customers.create({
      email: req.user.email,
      source: req.body.stripeToken
    })
    .then(customer =>
      stripe.subscriptions.create({
        customer: customer.id,
        items: [{plan: stripeSubscriptionPlan }],
      }))
    .then(charge => res.render("charge"));

    await stripe.customers.list(
      { email: req.user.email },
      function(err, customers) {
        // asynchronously called
        console.log(customers.data[0].subscriptions.data[0].id); //subscription id
        console.log(customers.data[0].id); //customer id
        User.findOneAndUpdate({ email: req.user.email }, { customer_id: customers.data[0].id })
        .then(User.findOne({ email: req.user.email }));
        User.findOneAndUpdate({ email: req.user.email }, { subscription_id: customers.data[0].subscriptions.data[0].id })
        .then(User.findOne({ email: req.user.email }));
      }
    );
  }
  
}