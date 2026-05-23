require("dotenv").config();
const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
    // Không có white_list vì API của Admin bắt buộc phải có token
    if (req?.headers?.authorization?.split(' ')?.[1]) {
        const token = req.headers.authorization.split(' ')[1];

        //verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // CHỐT CHẶN: Kiểm tra xem quyền có phải là ADMIN không
            if (decoded.role === "ADMIN") {
                req.user = {
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role
                }
                next(); // Là Admin thì cho phép đi tiếp
            } else {
                return res.status(403).json({
                    errCode: 1,
                    message: "Truy cập bị từ chối! Bạn không có quyền Quản trị viên (Admin)."
                });
            }
        } catch (error) {
            return res.status(401).json({
                errCode: 1,
                message: "Token bị hết hạn/hoặc không hợp lệ"
            });
        }
    } else {
        return res.status(401).json({
            errCode: 1,
            message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn"
        });
    }
}

module.exports = adminAuth;