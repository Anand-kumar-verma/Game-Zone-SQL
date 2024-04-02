const moment = require("moment");
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

exports.addAttendance = async (req, res) => {
  try {
    const { amount } = req.body;

    // Check if the amount is provided
    if (!amount) {
      return res.status(400).json({
        message: "amount parameter is missing",
      });
    }

    con.query(
      `INSERT INTO attendance (amount, status, datetime) VALUES (?, '1', ?)`,
      [amount, moment(new Date()).format("YYYY-MM-DD")],
      (updateErr, result) => {
        if (updateErr) {
          console.error(updateErr); // Log the error for debugging
          return res.status(500).json({
            message: "Error in updating data",
          });
        }

        return res.status(200).json({
          message: "Data added successfully",
          success: "200",
        });
      }
    );
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
      [email, oldPass],
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

exports.withdrawlRequestFun = async (req, res) => {
  console.log("function is called now");
  try {
    const { from_date, to_date } = req.body;

    console.log(from_date, to_date);

    if (!from_date || !to_date)
      return res.status(400).json({
        message: "Please provide both from date and to date.",
      });

    // Validate request data
    // You might need to use a validation library like Joi or express-validator for more complex validation
    if (
      (from_date && isNaN(Date.parse(from_date))) ||
      (to_date && isNaN(Date.parse(to_date)))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let condition = "";
    let params = [];

    if (to_date) {
      condition +=
        "DATE(`withdraw_history`.`request_date`) <= '" + to_date + "' AND ";
    }

    if (from_date) {
      condition +=
        "DATE(`withdraw_history`.`request_date`) >= '" + from_date + "' AND ";
    }

    condition += "`withdraw_history`.`status`= 0 AND ";
    condition += "`withdraw_history`.`user_id` <> 0 ";

    const query = `
    SELECT withdraw_history.*, user.username AS uname, user.mobile AS mobile, user.full_name AS fullname,
    account_details.account_no AS acno, account_details.bank_name AS bname, account_details.ifsc AS ifsc
    FROM withdraw_history
    LEFT JOIN user ON withdraw_history.user_id = user.id
    LEFT JOIN account_details ON account_details.user_id = user.id
    WHERE ${condition}
    ORDER BY withdraw_history.request_date DESC
`;

    con.query(query, async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Data not found",
          data: [],
        });
      }
      return res.status(200).json({
        message: "Data fetched successfully",
        data: result,
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.withdrawlApprovedFun = async (req, res) => {
  console.log("function is called now");
  try {
    const { id } = req.query;

    console.log(id);

    if (!id)
      return res.status(400).json({
        message: "Id is missing",
      });

    con.query(
      `UPDATE withdraw_history SET status='1',approve_date = '${moment(
        Date.now()
      ).format("YYYY-MM-DD HH:mm:ss")}' WHERE id=${id};`,
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
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.withdrawlRejectFun = async (req, res) => {
  console.log("function is called now");
  try {
    const { id } = req.query;

    console.log(id);

    if (!id)
      return res.status(400).json({
        message: "Id is missing",
      });

    con.query(
      `UPDATE withdraw_history SET status='2',approve_date = '${moment(
        Date.now()
      ).format("YYYY-MM-DD HH:mm:ss")}' WHERE id=${id};`,
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
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.withdrlApprovedFilterFun = async (req, res) => {
  console.log("Function is called now");
  try {
    const { from_date, to_date } = req.body;

    console.log(from_date, to_date);

    if (!from_date || !to_date)
      return res.status(400).json({
        message: "Please provide both from date and to date.",
      });

    // Validate request data
    // You might need to use a validation library like Joi or express-validator for more complex validation
    if (
      (from_date && isNaN(Date.parse(from_date))) ||
      (to_date && isNaN(Date.parse(to_date)))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let condition = "";
    let params = [];

    if (to_date) {
      condition += "DATE(`withdraw_history`.`approve_date`) <= ? AND ";
      params.push(to_date);
    }

    if (from_date) {
      condition += "DATE(`withdraw_history`.`approve_date`) >= ? AND ";
      params.push(from_date);
    }

    condition += "`withdraw_history`.`status`= 1 AND ";
    condition += "`withdraw_history`.`user_id` <> 0 ";

    const query = `
    SELECT withdraw_history.*, user.username AS uname, user.mobile AS mobile, user.full_name AS fullname,
    account_details.account_no AS acno, account_details.bank_name AS bname, account_details.ifsc AS ifsc
    FROM withdraw_history
    LEFT JOIN user ON withdraw_history.user_id = user.id
    LEFT JOIN account_details ON account_details.user_id = user.id
    WHERE ${condition}
    ORDER BY withdraw_history.request_date DESC
`;

    con.query(query, params, async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Data not found",
          data: [],
        });
      }
      return res.status(200).json({
        message: "Data fetched successfully",
        data: result,
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.withdrlRejectFilterFun = async (req, res) => {
  console.log("Function is called now");
  try {
    const { from_date, to_date } = req.body;

    console.log(from_date, to_date);

    if (!from_date || !to_date)
      return res.status(400).json({
        message: "Please provide both from date and to date.",
      });

    // Validate request data
    // You might need to use a validation library like Joi or express-validator for more complex validation
    if (
      (from_date && isNaN(Date.parse(from_date))) ||
      (to_date && isNaN(Date.parse(to_date)))
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let condition = "";
    let params = [];

    if (to_date) {
      condition += "DATE(`withdraw_history`.`request_date`) <= ? AND ";
      params.push(to_date);
    }

    if (from_date) {
      condition += "DATE(`withdraw_history`.`request_date`) >= ? AND ";
      params.push(from_date);
    }

    condition += "`withdraw_history`.`status`= 2 AND ";
    condition += "`withdraw_history`.`user_id` <> 0 ";

    const query = `
    SELECT withdraw_history.*, user.username AS uname, user.mobile AS mobile, user.full_name AS fullname,
    account_details.account_no AS acno, account_details.bank_name AS bname, account_details.ifsc AS ifsc
    FROM withdraw_history
    LEFT JOIN user ON withdraw_history.user_id = user.id
    LEFT JOIN account_details ON account_details.user_id = user.id
    WHERE ${condition}
    ORDER BY withdraw_history.request_date DESC
`;

    con.query(query, params, async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in data fetching",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Data not found",
          data: [],
        });
      }
      return res.status(200).json({
        message: "Data fetched successfully",
        data: result,
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.addSubAdmin = async (req, res) => {
  try {
    // status=1 it should be 1
    const {
      sub_admin_name,
      sub_admin_login_id,
      sub_admin_email,
      sub_admin_contact_no,
      sub_admin_password,
      sub_admin_confirm_password,
    } = req.body;

    if (
      !sub_admin_name ||
      !sub_admin_login_id ||
      !sub_admin_email ||
      !sub_admin_contact_no ||
      !sub_admin_password ||
      !sub_admin_confirm_password
    ) {
      return res.status(400).json({
        message: "Missing parameter",
      });
    }
    if (sub_admin_password !== sub_admin_confirm_password) {
      return res.status(400).json({
        message: "Password and confirm password should be same",
      });
    }

    // Check if the email or mobile already exists
    const checkIfExistsQuery = `SELECT * FROM m03_sub_admin WHERE sub_admin_email = ? OR sub_admin_contact_no = ?`;
    con.query(
      checkIfExistsQuery,
      [sub_admin_email, sub_admin_contact_no],
      (err, result) => {
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
        const insertQuery = `INSERT INTO m03_sub_admin (sub_admin_name, sub_admin_login_id, sub_admin_email, sub_admin_contact_no, sub_admin_password, sub_admin_confirm_password, sub_admin_status) VALUES (?, ?, ?, ?, ?, ?, 1)`;
        con.query(
          insertQuery,
          [
            sub_admin_name,
            sub_admin_login_id,
            sub_admin_email,
            sub_admin_contact_no,
            sub_admin_password,
            sub_admin_confirm_password,
          ],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Internal server error",
                error: err.message,
              });
            }

            return res.status(200).json({
              message: "Sub Admin added successfully",
            });
          }
        );
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
};
exports.getSubAdminList = async (req, res) => {
  try {
    const checkIfExistsQuery = `select * from m03_sub_admin where sub_admin_status=1`;
    con.query(checkIfExistsQuery, [], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Internal server error",
          error: err.message,
        });
      }

      if (result && result.length < 0) {
        // Email or mobile already exists
        return res.status(400).json({
          message: "No Data Found",
          data: [],
        });
      }
      return res.status(200).json({
        message: "Data Get successfully",
        data: result,
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
};
exports.getAllAssignedMenu = async (req, res) => {
  try {
    const checkIfExistsQuery = `select * from view_all_assigned_menu`;
    con.query(checkIfExistsQuery, [], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Internal server error",
          error: err.message,
        });
      }

      if (result && result.length < 0) {
        // Email or mobile already exists
        return res.status(400).json({
          message: "No Data Found",
          data: [],
        });
      }
      return res.status(200).json({
        message: "Data Get successfully",
        data: result,
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
};

exports.shwoMenu = async (req, res) => {
  try {
    const userId = req.params.id;

    // Query to select menu data
    const query = `
      SELECT menu_id, menu_name, menu_parent_id,
      IF((SELECT as_id FROM tr37_assign_menu WHERE as_sub_admin = ? AND as_menu = menu_id) IS NOT NULL, 'ASSIGN', 'NOT_ASSIGN') AS assign
      FROM tr36_menu
      WHERE menu_parent_id = 0 AND menu_status = 1
    `;

    // Execute the query
    con.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching menu:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.status(200).json({
        message: "Data Get successfully",
        data: results,
      });
    });
  } catch (err) {
    console.error("Error in showMenu function:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSubMenu = async (req, res) => {
  try {
    const { user_id, menu_id } = req.params;
    // Query to select menu data
    const query = `
      SELECT menu_id, menu_name,
      IF((SELECT as_id FROM tr37_assign_menu WHERE as_sub_admin = ? AND as_menu = ?) IS NOT NULL, 'ASSIGN', 'NOT_ASSIGN') AS assign
      FROM tr36_menu
      WHERE menu_parent_id = ? AND menu_status = 1
    `;

    // Execute the query
    con.query(query, [user_id, menu_id, menu_id], (err, results) => {
      if (err) {
        console.error("Error fetching menu:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.status(200).json({
        message: "Data Get successfully",
        data: results,
      });
    });
  } catch (err) {
    console.error("Error in showMenu function:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.addFund = async (req, res) => {
  try {
    const { login_id, type_id, wal_type, amount, msg } = req.body;

    // Check if required parameters are provided
    if (!login_id || !type_id || !wal_type || !amount || !msg) {
      return res.status(400).json({
        message: "One or more parameters are missing",
      });
    }

    // Start MySQL transaction
    con.beginTransaction((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error in starting transaction",
        });
      }

      // Execute stored procedure
      con.query(
        'CALL sp_fund_transfer(?, ?, ?, ?, ?, @msg)',
        [login_id, Number(type_id), Number(wal_type), parseFloat(Number(amount)), msg],
        (spErr, result) => {
          if (spErr) {
            console.error(spErr);
            return con.rollback(() => {
              res.status(500).json({
                message: "Error in executing stored procedure",
              });
            });
          }

          // Fetch the output message
          con.query('SELECT @msg AS msg', (selectErr, messageResult) => {
            if (selectErr) {
              console.error(selectErr);
              return con.rollback(() => {
                res.status(500).json({
                  message: "Error in fetching output message",
                });
              });
            }

            const msg = messageResult[0].msg;

            // Commit transaction
            con.commit((commitErr) => {
              if (commitErr) {
                console.error(commitErr);
                return con.rollback(() => {
                  res.status(500).json({
                    message: "Error in committing transaction",
                  });
                });
              }

              return res.status(200).json({
                message: msg,
                success: "200",
              });
            });
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