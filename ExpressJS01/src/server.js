require('dotenv').config();
const express = require('express'); 
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');

const Product = require('./models/product');
const Category = require('./models/category');

const app = express(); 
const port = process.env.PORT || 8080;

app.use(cors()); 
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

//khai báo route cho API
app.use('/v1/api/', apiRoutes);

(async () => {
    try {
        await connection();

        // Tự động kiểm tra và thêm dữ liệu nếu DB trống
        const countCategory = await Category.countDocuments();
        if (countCategory === 0) {
            console.log(">>> Database chưa có Danh mục. Đang tự động nạp...");
            const categoryData = [
                { name: '', displayName: 'Tất cả sản phẩm', count: 120 },
                { name: 'Túi Xách Da Thật', displayName: 'Túi Xách Da Thật', count: 35 },
                { name: 'Túi Đeo Chéo', displayName: 'Túi Đeo Chéo', count: 42 },
                { name: 'Túi Tote & Vải Canvas', displayName: 'Túi Tote & Vải Canvas', count: 18 },
                { name: 'Ví Cầm Tay', displayName: 'Ví & Ví Cầm Tay', count: 25 },
                { name: 'Túi Công Sở', displayName: 'Túi Công Sở', count: 10 }
            ];
            await Category.insertMany(categoryData);
            console.log(">>> Nạp Danh mục thành công!");
        }

        const count = await Product.countDocuments(); 
        if (count === 0) {
            console.log(">>> Database trống. Đang tự động nạp dữ liệu mẫu...");
            const mockData = [
                { 
                    name: 'Túi Xách Da Thật Cao Cấp', price: '1.250.000đ', 
                    img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Túi Xách Da Thật', isNewProduct: true, isBestSeller: false,
                    stock: 15, sold: 120, description: 'Túi xách da thật 100% nhập khẩu, thiết kế sang trọng, phù hợp cho các buổi tiệc hoặc dạo phố. Ngăn chứa rộng rãi, đường may tỉ mỉ.'
                },
                { 
                    name: 'Túi Đeo Chéo Dạo Phố', price: '650.000đ', 
                    img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Túi Đeo Chéo', isNewProduct: true, isBestSeller: false,
                    stock: 50, sold: 45, description: 'Phom dáng trẻ trung, năng động. Chất liệu da PU cao cấp chống thấm nước nhẹ, dễ dàng phối với nhiều trang phục khác nhau.'
                },
                { 
                    name: 'Túi Tote Vải Canvas Họa Tiết', price: '350.000đ', 
                    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1605733556294-9642e6bc8da2?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Túi Tote & Vải Canvas', isNewProduct: true, isBestSeller: false,
                    stock: 100, sold: 200, description: 'Túi Tote thân thiện môi trường, sức chứa "đựng cả thế giới", vừa vặn laptop 14 inch và tài liệu A4. Phù hợp cho sinh viên và dân văn phòng.'
                },
                
                { 
                    name: 'Túi Công Sở Thanh Lịch', price: '1.800.000đ', 
                    img: 'https://images.unsplash.com/photo-1605733556294-9642e6bc8da2?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1605733556294-9642e6bc8da2?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1614179689702-355944cd0918?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Túi Công Sở', isNewProduct: false, isBestSeller: true,
                    stock: 5, sold: 350, description: 'Mẫu túi kinh điển cho các quý cô công sở. Thiết kế đứng phom, bảo vệ giấy tờ và thiết bị tốt. Đi kèm dây đeo chéo có thể tháo rời.'
                },
                { 
                    name: 'Ví Cầm Tay Dự Tiệc', price: '1.100.000đ', 
                    img: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1614179689702-355944cd0918?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Ví Cầm Tay', isNewProduct: false, isBestSeller: true,
                    stock: 20, sold: 85, description: 'Ví cầm tay đính đá sang chảnh, thu hút mọi ánh nhìn trong các buổi tiệc đêm. Lớp lót nhung mềm mại bên trong giúp bảo vệ điện thoại và mỹ phẩm.'
                },
                { 
                    name: 'Túi Kẹp Nách Trendy', price: '850.000đ', 
                    img: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=500&auto=format&fit=crop', 
                    images: [
                        'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=500&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1605733556294-9642e6bc8da2?q=80&w=500&auto=format&fit=crop'
                    ],
                    category: 'Túi Đeo Chéo', isNewProduct: false, isBestSeller: true,
                    stock: 0, sold: 500, description: 'Xu hướng túi kẹp nách phong cách Y2K cực hot. Dáng túi hình bán nguyệt ôm sát người, mang lại cảm giác thời thượng và phá cách.'
                }
            ];
            await Product.insertMany(mockData);
            console.log(">>> Nạp dữ liệu mẫu thành công!");
        } else {
            console.log(`>>> Database đã có sẵn ${count} sản phẩm.`);
        }

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()