const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const userAddressRoute = require('./userAddress.route');
const notificationRoute = require('./notification.route');
const uploadRoute = require('./upload.route');
const petRoute = require('./pet.route');
const dailyQuestRoute = require('./dailyQuest.route');
const weeklyQuestRoute = require('./weeklyQuest.route');
const achievementRoute = require('./achievement.route');
const healthRoute = require('./health.route');
const familyRoute = require('./family.route');
const subscriptionRoute = require('./subscription.route');

// TODO: Import more routes as you build features
// const productRoute = require('./product.route');
// const cartRoute = require('./cart.route');
// const orderRoute = require('./order.route');
// const appointmentRoute = require('./appointment.route');
// const listingRoute = require('./listing.route');

const router = express.Router();

const defaultRoutes = [
    { path: '/health', route: express.Router().get('/', (req, res) => res.status(200).json({ status: 'UP', service: 'PetcareHub365', timestamp: new Date() })) },
    { path: '/pet-health', route: healthRoute },
    { path: '/family', route: familyRoute },
    { path: '/subscriptions', route: subscriptionRoute },
    { path: '/auth', route: authRoute },
    { path: '/users/addresses', route: userAddressRoute },
    { path: '/users', route: userRoute },
    { path: '/notifications', route: notificationRoute },
    { path: '/upload', route: uploadRoute },
    { path: '/pets', route: petRoute },
    { path: '/daily-quests', route: dailyQuestRoute },
    { path: '/weekly-quests', route: weeklyQuestRoute },
    { path: '/achievements', route: achievementRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
