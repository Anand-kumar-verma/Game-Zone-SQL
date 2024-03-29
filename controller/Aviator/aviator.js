const con = require("../../config/database");

exports.promotionCount =async(req, res) => {
  // con.connect();
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      message: "Id is missing",
    });
  }

  // Check if the provided ID is a valid number
  if (isNaN(id)) {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  let array = [];
  try {
    con.query("SELECT * FROM user", (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Error in data fetching",
          error: err.message,
          er: err,
        });
      }
      // console.log(result);
      array = result;
      // console.log(array, "This is final result");

      array = array?.map((i) => {
        return { ...i, count: 0, teamcount: 0 };
      });

      console.log(id, "this is new data");
      // let new_data = updateReferralCount(array)
      let new_data = updateReferralCountnew(array)?.find((i) => i.id == id);

      if (result && result.length > 0) {
        return res.status(200).json({
          data: new_data,
          msg: "Data fetched successfully",
        });
      } else {
        return res.status(404).json({
          msg: "No data found",
        });
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error in data fetching",
      error: e.message,
    });
  }
  // con.release();
};

function updateReferralCountnew(users) {
  const countMap = {};
  const teamCountMap = {};
  const depositMemberMap = {}; // Map to store the count of direct referrals with first_recharge = 1
  const depositMemberTeamMap = {}; // Map to store the count of direct and indirect referrals with first_recharge = 1
  const depositRechargeMap = {}; // Map to store the total sum of recharge amounts for direct referrals
  const depositRechargeTeamMap = {}; // Map to store the total sum of recharge amounts for direct and indirect referrals

  // Initialize count for each user
  users.forEach((user) => {
    countMap[user.id] = 0;
    teamCountMap[user.id] = 0;
    depositMemberMap[user.id] = 0;
    depositMemberTeamMap[user.id] = 0;
    depositRechargeMap[user.id] = 0;
    depositRechargeTeamMap[user.id] = 0;
  });

  // Update count for each referral used
  users.forEach((user) => {
    if (user.referral_user_id !== null) {
      countMap[user.referral_user_id]++;
    }
  });

  // Update team count, deposit_member, and deposit_member_team count for each user recursively
  const updateTeamCountRecursively = (user) => {
    let totalChildrenCount = countMap[user.id];
    users.forEach((u) => {
      if (u.referral_user_id === user.id) {
        totalChildrenCount += updateTeamCountRecursively(u);
      }
    });
    return totalChildrenCount;
  };

  // Update deposit_recharge and deposit_recharge_team for each user recursively
  const updateRechargeRecursively = (user) => {
    let totalRecharge = user.recharge;
    users.forEach((u) => {
      if (u.referral_user_id === user.id) {
        totalRecharge += updateRechargeRecursively(u);
      }
    });
    return totalRecharge;
  };

  users.forEach((user) => {
    teamCountMap[user.id] = updateTeamCountRecursively(user);
    // Update deposit_member count for direct referrals
    if (user.referral_user_id !== null && user.recharge >0) {
      depositMemberMap[user.referral_user_id]++;
    }
    // Update deposit_member_team count for direct and indirect referrals
    if (user.recharge === 1) {
      depositMemberTeamMap[user.id] = teamCountMap[user.id];
    }
    // Update deposit_recharge for direct referrals
    if (user.referral_user_id !== null) {
      depositRechargeMap[user.referral_user_id] += user.recharge;
    }
    // Update deposit_recharge_team recursively
    depositRechargeTeamMap[user.id] =
      user.recharge + updateRechargeRecursively(user);
  });

  // Assign counts to each user
  users.forEach((user) => {
    user.count = countMap[user.id];
    user.teamcount = teamCountMap[user.id] || 0; // Set default value to 0 if undefined
    user.deposit_member = depositMemberMap[user.id] || 0; // Set default value to 0 if undefined
    user.deposit_member_team = depositMemberTeamMap[user.id] || 0; // Set default value to 0 if undefined
    user.deposit_recharge = depositRechargeMap[user.id] || 0; // Set default value to 0 if undefined
    user.deposit_recharge_team = depositRechargeTeamMap[user.id] || 0; // Set default value to 0 if undefined
  });

  return users;
}
