const con = require("../../config/database");

exports.loginFun = async (req, res) => {
  try {
    const { email, password } = req.body;
    con.query(
      `SELECT * FROM user WHERE email='${email}' AND password='${password}'`,
      (err, result) => {
        console.log(result, "result");
        if (result.length > 0) {
          return res.status(200).json({
            data: result,
            message: "Data get successfully",
            success: "200",
          });
        } else {
          return res.status(400).json({
            message: "Error in data fetching",
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Error in data fetching",
    });
  }
};

exports.dashboardCounter = async (req, res) => {
  try {
    con.query(
      `SELECT
    (SELECT COUNT(id) FROM user) as totaluser,
    (SELECT COUNT(*) FROM (SELECT e.*, m.username AS sname, m.full_name AS sfullname FROM user e LEFT JOIN user m ON e.referral_user_id = m.id) as totalplayer) as totalplayer,
    (SELECT COUNT(id) FROM game_setting) as totalgames,
    (SELECT COUNT(id) FROM colour_bet) as totalbet,
    (SELECT COUNT(id) FROM user WHERE status=${1}) as activeuser,
    (SELECT COUNT(id) FROM feedback) as totalfeedback,
    (SELECT SUM(actual_amount) FROM withdraw_history )as tamount,
    (SELECT SUM(recharge) FROM user )as trecharge,
    (SELECT SUM(amount) FROM user_payin where status='1')as totaldeposit,
    (SELECT SUM(amount) FROM user_payin WHERE status='1' AND DATE(created_at) = CURDATE()) as todaydeposit,
    COUNT(id) as users,
    SUM(commission) as commissions,
    SUM(turnover) as total_turnover,
    SUM(today_turnover) as todayturnover
  FROM user;`,
      (err, result) => {
        if (result.length > 0) {
          return res.status(200).json({
            data: result[0],
            message: "Data get successfully",
            success: "200",
          });
        } else {
          return res.status(400).json({
            message: "Error in data fetching",
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Error in data fetching",
    });
  }
};

exports.getAllAttendanceList = async (req, res) => {
  try {
    con.query(`SELECT * FROM attendance;`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      if (result.length > 0) {
        return res.status(200).json({
          data: result,
          message: "Data get successfully",
          success: "200",
        });
      } else {
        return res.status(404).json({
          message: "No attendance records found",
          data: [],
          success: "404",
        });
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.deleteAttendanceById = async (req, res) => {
  try {
    const { id } = req.query;

    // Check if the ID is provided
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is missing",
      });
    }

    // Check if the provided ID is a valid number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Execute the SQL query to check if the attendance record exists
    con.query(`SELECT * FROM attendance WHERE id=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // If the record exists, proceed with deletion
      con.query(
        `DELETE FROM attendance WHERE id=${id}`,
        (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json({
              message: "Error in deleting data",
            });
          }

          return res.status(200).json({
            message: "Data deleted successfully",
            success: "200",
          });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.updateAttendanceById = async (req, res) => {
  try {
    const { id, amount } = req.query;

    // Check if the ID is provided
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is missing",
      });
    }

    // Check if the provided ID is a valid number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Execute the SQL query to check if the attendance record exists
    con.query(`SELECT * FROM attendance WHERE id=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // If the record exists, proceed with deletion
      con.query(
        `UPDATE attendance SET amount=${amount} WHERE id=${id}`,
        (updateErr, deleteResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({
              message: "Error in updating data",
            });
          }

          return res.status(200).json({
            message: "Data update successfully",
            success: "200",
          });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getAllPlayer = async (req, res) => {
  try {
    con.query(
      `SELECT e.*, m.username AS sname, m.full_name AS sfullname FROM user e LEFT JOIN user m ON e.referral_user_id = m.id;`,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Error in data fetching",
          });
        }

        if (result.length > 0) {
          console.log(result.length);
          return res.status(200).json({
            data: result,
            message: "Data retrieved successfully",
            success: "200",
          });
        } else {
          return res.status(404).json({
            message: "No player data found",
          });
        }
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.updatePlayerRecord = async (req, res) => {
  try {
    const { id, email, mobile, password } = req.body;

    // Check if the ID is provided
    if (!id || !email || !mobile || !password) {
      return res.status(400).json({
        message:
          "Please check email and mobile no,full name parameter , This is mandatry field",
      });
    }

    // Check if the provided ID is a valid number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Execute the SQL query to check if the user exists
    con.query(`SELECT * FROM user WHERE id=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // If the record exists, proceed with the update
      con.query(
        `UPDATE user SET email='${email}', mobile='${mobile}', password='${password}' WHERE id=${id}`,
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({
              message: "Error in updating data",
            });
          }

          return res.status(200).json({
            message: "Data updated successfully",
            success: "200",
          });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.updatePlayerStatus = async (req, res) => {
  try {
    const { id } = req.body;

    console.log(id, "this is simple id");
    // Check if the ID is provided
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

    // Execute the SQL query to check if the user exists
    con.query(`SELECT * FROM user WHERE id=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Get the current status value
      const currentStatus = result[0].status;
      // Calculate the new status value
      const newStatus = currentStatus === "1" ? "0" : "1";

      // If the record exists, proceed with the update
      con.query(
        `UPDATE user SET status=${newStatus} WHERE id=${id};`,
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({
              message: "Error in updating data",
            });
          }

          return res.status(200).json({
            message: "Data updated successfully",
            success: "200",
            newStatus: newStatus, // Return the new status value if needed
          });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.addPlayer = async (req, res) => {
  try {
    // status=1 it should be 1
    const { referral_user_id, full_name, username, password, email, mobile } =
      req.body;

    if (
      !referral_user_id ||
      !full_name ||
      !username ||
      !password ||
      !email ||
      !mobile
    ) {
      return res.status(400).json({
        message: "Missing parameter",
      });
    }

    // Check if the email or mobile already exists
    const checkIfExistsQuery = `SELECT * FROM user WHERE email = ? OR mobile = ?`;
    con.query(checkIfExistsQuery, [email, mobile], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Internal server error",
          error: err.message,
        });
      }

      if (result && result.length > 0) {
        // Email or mobile already exists
        return res.status(400).json({
          message: "Email or mobile number already exists",
        });
      }

      // Insert the new user into the database
      const insertQuery = `INSERT INTO user (referral_user_id, full_name, username, password, email, mobile, status) VALUES (?, ?, ?, ?, ?, ?, 1)`;
      con.query(
        insertQuery,
        [referral_user_id, full_name, username, password, email, mobile],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Internal server error",
              error: err.message,
            });
          }

          return res.status(200).json({
            message: "User added successfully",
          });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
};

exports.getUserByRedId = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        message: "Id is missing",
      });
    }
    // Execute the SQL query to check if the user exists
    con.query(`SELECT * FROM user WHERE username=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      return res.status(200).json({
        message: "Data get successfully",
        success: "200",
        data: result[0], // Return the new status value if needed
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getUserDataById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        message: "Id is missing",
      });
    }
    // Execute the SQL query to check if the user exists
    con.query(`SELECT * FROM user WHERE id=${id}`, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      // Check if any record is found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      return res.status(200).json({
        message: "Data get successfully",
        success: "200",
        data: result[0], // Return the new status value if needed
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, oldPass, newPass } = req.body;

    if (!email || !oldPass || !newPass) {
      return res.status(400).json({
        message: "All parameters are mandatory",
      });
    }

    con.query(
      "SELECT * FROM user WHERE email = ? AND password = ?",
      [email,oldPass],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Error in data fetching",
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            message: "Your email or password not matches from your record",
          });
        }
        const user = result[0];

        con.query(
          "UPDATE user SET password = ? WHERE id = ?",
          [newPass, user.id],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error(updateErr);
              return res.status(500).json({
                message: "Error in updating data",
              });
            }

            return res.status(200).json({
              message: "Password updated successfully",
            });
          }
        );
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
