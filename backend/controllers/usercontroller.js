import pool from "../config/db.js";

//  Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await pool.query("SELECT user_id, username, email, role FROM users WHERE user_id = $1", [req.user.user_id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//  Update User Profile
export const updateUserProfile = async (req, res) => {
    const { username } = req.body;

    try {
        const updatedUser = await pool.query(
            "UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *",
            [username, req.user.user_id]
        );

        res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
