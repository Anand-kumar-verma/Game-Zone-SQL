const { json } = require("express");
const con = require("../../config/database");

exports.promotionCount = async (req, res) => {
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
        return { ...i, count: 0, teamcount: 0, directReferrals: [] };
      });

      let new_data = updateReferralCountnew(array)?.find((i) => i.id == id);
      let levels = Array.from({ length: 20 }, (_, i) => `level_${i + 1}`);
   
      // Add more levels as needed

      for (let i =levels.length - 1; i >= 0; i--) {
        let currentLevel = new_data?.teamMembersByLevel[levels[i-1]];
        let nextLevel = new_data?.teamMembersByLevel[levels[i]];

        if (currentLevel && nextLevel) {
          let idsToRemove = currentLevel.map((item) => item.id);
          nextLevel = nextLevel.filter(
            (item) => !idsToRemove.includes(item.id)
          );
          new_data.teamMembersByLevel[levels[i]] = nextLevel;
        }
      }

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
    user.directReferrals = []; // Initialize directReferrals array for each user
  });

  // Update count for each referral used
  users.forEach((user) => {
    // Check if referral_user_id exists in countMap
    if (countMap.hasOwnProperty(user.referral_user_id)) {
      // Increase the count for the referral_user_id by 1
      countMap[user.referral_user_id]++;
    }
  });
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

  // Update team count, deposit_member, and deposit_member_team count for each user recursively
  const updateTeamCountRecursively = (user) => {
    let totalChildrenCount = 0;

    // Check if the user id exists in countMap
    if (countMap.hasOwnProperty(user.id)) {
      totalChildrenCount += countMap[user.id];

      // Iterate through each user
      users.forEach((u) => {
        // Check if the user's referral_user_id matches the current user's id
        if (u.referral_user_id === user.id) {
          // Check if the user's referral_user_id is not null
          if (user.referral_user_id !== null) {
            // Check if the directReferrals array does not already contain the current user
            if (
              !user.directReferrals.some((referral) => referral.c_id === u.id)
            ) {
              // If not, add the user to the directReferrals array
              user.directReferrals.push({
                user_name: u.full_name,
                mobile: u.mobile,
                c_id: u.id,
                id: u.username,
              });
            }
          }
          // Recursively update the team count for the current user
          totalChildrenCount += updateTeamCountRecursively(u);
        }
      });
    }

    return totalChildrenCount;
  };

  users.forEach((user) => {
    // Update teamCountMap if user.id exists in countMap
    if (countMap.hasOwnProperty(user.id)) {
      teamCountMap[user.id] = updateTeamCountRecursively(user);
    }

    // Update deposit_member count for direct referrals
    if (user.referral_user_id !== null && user.recharge > 0) {
      if (depositMemberMap.hasOwnProperty(user.referral_user_id)) {
        depositMemberMap[user.referral_user_id]++;
      }
    }

    // Update deposit_member_team count for direct and indirect referrals
    if (user.recharge === 1) {
      if (countMap.hasOwnProperty(user.id)) {
        depositMemberTeamMap[user.id] = teamCountMap[user.id];
      }
    }

    // Update deposit_recharge for direct referrals
    if (user.referral_user_id !== null) {
      if (depositRechargeMap.hasOwnProperty(user.referral_user_id)) {
        depositRechargeMap[user.referral_user_id] += user.recharge;
      }
    }

    // Update deposit_recharge_team recursively
    if (countMap.hasOwnProperty(user.id)) {
      depositRechargeTeamMap[user.id] =
        user.recharge + updateRechargeRecursively(user);
    }

    // Add direct referral to the user's directReferrals array
  });

  const updateUserLevelRecursively = (user, level, maxLevel) => {
    if (level === 0 || level > maxLevel) return []; // Return an empty array if we reached the desired level or exceeded the maximum level

    const levelMembers = [];

    // Iterate through each user
    users.forEach((u) => {
      // Check if the user's referral_user_id matches the current user's id
      if (u.referral_user_id === user.id) {
        // Add the user's full_name and id to the levelMembers array
        levelMembers.push({ full_name: u.full_name, id: u.id });

        // Recursively update the team members for the current user at the next level
        const children = updateUserLevelRecursively(u, level + 1, maxLevel); // Increase level for the next level
        levelMembers.push(...children); // Concatenate children to the current levelMembers array
      }
    });

    return levelMembers;
  };

  users.forEach((user) => {
    // Initialize arrays for each level of team members
    user.teamMembersByLevel = {};

    // Populate arrays with team members at each level
    for (let i = 1; i <= 20; i++) {
      const levelMembers = updateUserLevelRecursively(user, 1, i); // Start from level 1 and set the maximum level for this user
      user.teamMembersByLevel[`level_${i}`] = levelMembers;
      if (levelMembers.length === 0) break; // Stop populating arrays if no team members at this level
    }
  });
  // Assign counts to each user
  users.forEach((user) => {
    // Update user properties with countMap, teamCountMap, depositMemberMap, depositMemberTeamMap,
    // depositRechargeMap, and depositRechargeTeamMap if user.id exists in the respective maps
    user.count = countMap.hasOwnProperty(user.id) ? countMap[user.id] : 0;
    user.teamcount = teamCountMap.hasOwnProperty(user.id)
      ? teamCountMap[user.id]
      : 0;
    user.deposit_member = depositMemberMap.hasOwnProperty(user.id)
      ? depositMemberMap[user.id]
      : 0;
    user.deposit_member_team = depositMemberTeamMap.hasOwnProperty(user.id)
      ? depositMemberTeamMap[user.id]
      : 0;
    user.deposit_recharge = depositRechargeMap.hasOwnProperty(user.id)
      ? depositRechargeMap[user.id]
      : 0;
    user.deposit_recharge_team = depositRechargeTeamMap.hasOwnProperty(user.id)
      ? depositRechargeTeamMap[user.id]
      : 0;
  });
  return users;
}

exports.topw11winningInformation = async (req, res) => {
  try {
    con.query(
      "SELECT colour_bet.*, user.full_name, user.winning_wallet, user.email FROM colour_bet JOIN user ON colour_bet.userid = user.id ORDER BY CAST(colour_bet.win AS UNSIGNED) DESC LIMIT 11;",
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Error in data fetching",
            error: err.message,
          });
        }

        if (result && result.length > 0) {
          return res.status(200).json({
            msg: "Data fetched successfully",
            data: result,
          });
        } else {
          return res.status(404).json({
            msg: "No data found",
          });
        }
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error in data fetching",
      error: e.message,
    });
  }
};
