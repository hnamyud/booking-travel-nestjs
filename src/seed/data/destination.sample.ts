const ID_PHU_QUOC = '664b5f9a2d3e1a4f5c6b7d8a';
const ID_HA_GIANG = '664b5f9a2d3e1a4f5c6b7d8b';
const ID_HOI_AN = '664b5f9a2d3e1a4f5c6b7d8c';
const ID_SAI_GON = '664b5f9a2d3e1a4f5c6b7d8d';

export const getInitDestinations = async () => {
    return [
        {
            _id: ID_PHU_QUOC,
            name: 'Phú Quốc',
            country: 'Việt Nam',
            description: 'Đảo Ngọc thiên đường với bãi Sao cát trắng, cáp treo Hòn Thơm và thành phố không ngủ Grand World.',
            images: [
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/phu-quoc-1.jpg',
                    public_id: 'phu-quoc-1'
                },
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/phu-quoc-2.jpg',
                    public_id: 'phu-quoc-2'
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 2. Hà Giang (Dùng cho Tour mạo hiểm)
        {
            _id: ID_HA_GIANG,
            name: 'Hà Giang',
            country: 'Việt Nam',
            description: 'Vùng đất địa đầu tổ quốc với cao nguyên đá Đồng Văn hùng vĩ và những cung đường đèo uốn lượn.',
            images: [
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/ha-giang-1.jpg',
                    public_id: 'ha-giang-1'
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 3. Phố Cổ Hội An (Dùng cho Tour văn hóa)
        {
            _id: ID_HOI_AN,
            name: 'Phố Cổ Hội An',
            country: 'Việt Nam',
            description: 'Di sản văn hóa thế giới với những ngôi nhà cổ màu vàng nghệ, đèn lồng rực rỡ và ẩm thực Cao Lầu đặc trưng.',
            images: [
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/hoi-an-main.jpg',
                    public_id: 'hoi-an-main'
                },
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/hoi-an-night.jpg',
                    public_id: 'hoi-an-night'
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 4. TP. Hồ Chí Minh (Dùng cho Tour City)
        {
            _id: ID_SAI_GON,
            name: 'TP. Hồ Chí Minh',
            country: 'Việt Nam',
            description: 'Trung tâm kinh tế sầm uất, nơi giao thoa giữa nét cổ kính của Chợ Bến Thành và sự hiện đại của Landmark 81.',
            images: [
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/v1716000000/destinations/saigon-1.jpg',
                    public_id: 'saigon-1'
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ]
}