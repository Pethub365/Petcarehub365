const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Session = require('./Session');
const InvalidatedToken = require('./InvalidatedToken');
const PasswordResetToken = require('./PasswordResetToken');
const EmailVerificationToken = require('./EmailVerificationToken');
const UserAddress = require('./UserAddress');
const Notification = require('./Notification');
const Pet = require('./Pet');
const VetKnowledge = require('./VetKnowledge');
const DailyQuest = require('./DailyQuest');
const WeeklyQuest = require('./WeeklyQuest');
const { Achievement, UserAchievement } = require('./Achievement');
const PetMoment = require('./PetMoment');
const FamilyGroup = require('./FamilyGroup');
const FamilyInvitation = require('./FamilyInvitation');
const DeviceToken = require('./DeviceToken');
const HealthLog = require('./HealthLog');
const Vaccine = require('./Vaccine');
const Subscription = require('./Subscription');
const PaymentTransaction = require('./PaymentTransaction');

// TODO: Add more domain-specific models as you build the project
// e.g., VetClinic, Appointment, Product, Order, Cart, etc.

module.exports = {
    User,
    Role,
    Permission,
    Session,
    InvalidatedToken,
    PasswordResetToken,
    EmailVerificationToken,
    UserAddress,
    Notification,
    Pet,
    VetKnowledge,
    DailyQuest,
    WeeklyQuest,
    Achievement,
    UserAchievement,
    PetMoment,
    FamilyGroup,
    FamilyInvitation,
    DeviceToken,
    HealthLog,
    Vaccine,
    Subscription,
    PaymentTransaction,
};
