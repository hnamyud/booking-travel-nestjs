// --- CONSTANTS: DESTINATION IDs (Lấy từ bước trước) ---
const ID_DEST_PHU_QUOC = '664b5f9a2d3e1a4f5c6b7d8a';
const ID_DEST_HA_GIANG = '664b5f9a2d3e1a4f5c6b7d8b';
const ID_DEST_HOI_AN = '664b5f9a2d3e1a4f5c6b7d8c';
const ID_DEST_SAI_GON = '664b5f9a2d3e1a4f5c6b7d8d';

// --- CONSTANTS: TOUR IDs (Tạo mới cứng để dễ test Booking sau này) ---
const ID_TOUR_PHU_QUOC = '664b60002d3e1a4f5c6b8001';
const ID_TOUR_HA_GIANG = '664b60002d3e1a4f5c6b8002';
const ID_TOUR_HOI_AN = '664b60002d3e1a4f5c6b8003';
const ID_TOUR_SAI_GON = '664b60002d3e1a4f5c6b8004';

export const getInitTours = async () => {
    return [
        {
            _id: ID_TOUR_PHU_QUOC,
            name: 'Thiên đường nghỉ dưỡng Phú Quốc 4N3Đ',
            description: 'Trải nghiệm lặn ngắm san hô tại Hòn Móng Tay, thưởng thức hải sản tươi sống và ngắm hoàng hôn đẹp nhất Việt Nam tại Sunset Sanato.',
            duration: '4 ngày 3 đêm',
            durationDays: 4,
            price: 5500000,
            timeStart: new Date('2024-06-15T08:00:00.000Z'),
            timeEnd: new Date('2025-06-19T17:00:00.000Z'),
            totalSlots: 20,
            availableSlots: 5,
            bookedParticipants: 15,
            isAvailable: true,
            destinations: [ID_DEST_PHU_QUOC], // ✅ Match với Destination Phú Quốc
            ratingAverage: 4.8,
            ratingQuantity: 125,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 2. Tour Núi (Link tới Hà Giang)
        {
            _id: ID_TOUR_HA_GIANG,
            name: 'Chinh phục Cao nguyên đá Hà Giang - Mùa hoa Tam Giác Mạch',
            description: 'Khám phá đèo Mã Pí Lèng huyền thoại, đi thuyền trên sông Nho Quế và tìm hiểu văn hóa người H\'Mông.',
            duration: '3 ngày 2 đêm',
            durationDays: 3,
            price: 3200000,
            timeStart: new Date('2024-10-10T05:00:00.000Z'),
            timeEnd: new Date('2025-10-13T20:00:00.000Z'),
            totalSlots: 15,
            availableSlots: 15,
            bookedParticipants: 0,
            isAvailable: true,
            destinations: [ID_DEST_HA_GIANG], // ✅ Match với Destination Hà Giang
            ratingAverage: 0,
            ratingQuantity: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 3. Tour Văn Hóa (Link tới Hội An)
        {
            _id: ID_TOUR_HOI_AN,
            name: 'Hành trình di sản miền Trung: Phố cổ Hội An',
            description: 'Tham quan những ngôi nhà cổ, thả đèn hoa đăng và thưởng thức Cao Lầu.',
            duration: '5 ngày 4 đêm',
            durationDays: 5,
            price: 2800000,
            timeStart: new Date('2024-01-20T07:00:00.000Z'),
            timeEnd: new Date('2025-01-25T18:00:00.000Z'),
            totalSlots: 30,
            availableSlots: 0,
            bookedParticipants: 30,
            isAvailable: false,
            destinations: [ID_DEST_HOI_AN], // ✅ Match với Destination Hội An
            ratingAverage: 4.5,
            ratingQuantity: 300,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // 4. Tour City (Link tới Sài Gòn)
        {
            _id: ID_TOUR_SAI_GON,
            name: 'Khám phá ẩm thực đường phố Sài Gòn (Night Tour)',
            description: 'Vi vu xe máy khám phá các ngõ ngách Sài Gòn và thưởng thức 10 món ăn đường phố đặc sắc.',
            duration: '4 tiếng',
            durationDays: 0.5,
            price: 750000,
            timeStart: new Date('2024-08-05T18:00:00.000Z'),
            timeEnd: new Date('2025-08-05T22:00:00.000Z'),
            totalSlots: 10,
            availableSlots: 8,
            bookedParticipants: 2,
            isAvailable: true,
            destinations: [ID_DEST_SAI_GON], // ✅ Match với Destination Sài Gòn
            ratingAverage: 4.9,
            ratingQuantity: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ]
}