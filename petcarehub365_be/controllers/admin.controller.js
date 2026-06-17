const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { User, Pet, PaymentTransaction } = require('../models');

exports.getStats = catchAsync(async (req, res) => {
  // 1. User Stats
  const totalUsers = await User.countDocuments();
  
  // Users by plan
  const usersByPlan = await User.aggregate([
    {
      $group: {
        _id: '$subscription_plan',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const planStats = {
    FREE: 0,
    PREMIUM: 0,
    VIP: 0
  };
  usersByPlan.forEach(p => {
    if (p._id && planStats[p._id] !== undefined) {
      planStats[p._id] = p.count;
    } else {
      planStats.FREE += p.count; // Fallback
    }
  });

  // New users in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersLast7Days = await User.countDocuments({
    created_at: { $gte: sevenDaysAgo }
  });

  // 2. Pet Stats
  const totalPets = await Pet.countDocuments();
  
  // Pets by species
  const petsBySpecies = await Pet.aggregate([
    {
      $group: {
        _id: '$species',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const speciesStats = {};
  petsBySpecies.forEach(s => {
    const key = s._id ? s._id.toUpperCase() : 'OTHER';
    speciesStats[key] = s.count;
  });

  const avgPetsPerUser = totalUsers > 0 ? Number((totalPets / totalUsers).toFixed(2)) : 0;

  // 3. Revenue Stats
  const successTransactions = await PaymentTransaction.find({ status: 'SUCCESS' })
    .populate('user_id', 'email profile.full_name')
    .sort({ created_at: -1 });

  const totalRevenue = successTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Revenue by plan
  const revenueByPlan = {
    PREMIUM: 0,
    VIP: 0
  };
  successTransactions.forEach(tx => {
    if (tx.plan_type === 'PREMIUM') {
      revenueByPlan.PREMIUM += tx.amount || 0;
    } else if (tx.plan_type === 'VIP') {
      revenueByPlan.VIP += tx.amount || 0;
    }
  });

  // Transaction status count
  const allTxCount = await PaymentTransaction.countDocuments();
  const successTxCount = successTransactions.length;
  const pendingTxCount = await PaymentTransaction.countDocuments({ status: 'PENDING' });
  const failedTxCount = await PaymentTransaction.countDocuments({ status: 'FAILED' });

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        plans: planStats,
        newLast7Days: newUsersLast7Days
      },
      pets: {
        total: totalPets,
        species: speciesStats,
        averagePerUser: avgPetsPerUser
      },
      revenue: {
        total: totalRevenue,
        byPlan: revenueByPlan,
        transactions: successTransactions.map(tx => ({
          _id: tx._id,
          user: {
            email: tx.user_id?.email || 'N/A',
            name: tx.user_id?.profile?.full_name || 'N/A'
          },
          plan_type: tx.plan_type,
          package_duration: tx.package_duration,
          amount: tx.amount,
          paid_at: tx.paid_at || tx.created_at
        })),
        statusCount: {
          total: allTxCount,
          success: successTxCount,
          pending: pendingTxCount,
          failed: failedTxCount
        }
      }
    }
  });
});
