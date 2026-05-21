const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const userAddressRoute = require('./userAddress.route');
const notificationRoute = require('./notification.route');
const uploadRoute = require('./upload.route');

// TODO: Import more routes as you build features
// const petRoute = require('./pet.route');
// const productRoute = require('./product.route');
// const cartRoute = require('./cart.route');
// const orderRoute = require('./order.route');
// const appointmentRoute = require('./appointment.route');
// const listingRoute = require('./listing.route');

const router = express.Router();

const defaultRoutes = [
    { path: '/health', route: express.Router().get('/', (req, res) => res.status(200).json({ status: 'UP', service: 'PetcareHub365', timestamp: new Date() })) },
    { path: '/auth', route: authRoute },
    { path: '/users/addresses', route: userAddressRoute },
    { path: '/users', route: userRoute },
    { path: '/notifications', route: notificationRoute },
    { path: '/upload', route: uploadRoute },
    // TODO: Add more routes here
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
