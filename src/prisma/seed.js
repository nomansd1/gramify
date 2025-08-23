import prisma from "../db/index.js";

const users = [
    {
        username: "hira123",
        email: "hira.chaudhry68@gmail.com",
        name: "Hira Chaudhry",
        password: "123456"
    },
    {
        username: "muneeb123",
        email: "muneeb.butt90@gmail.com",
        name: "Muneeb Butt",
        password: "123456"
    },
    {
        username: "sana123",
        email: "sana.chaudhry92@gmail.com",
        name: "Sana Chaudhry",
        password: "123456"
    },
    {
        username: "laiba123",
        email: "laiba.butt69@gmail.com",
        name: "Laiba Butt",
        password: "123456"
    },
    {
        username: "sara123",
        email: "sara.nawaz93@gmail.com",
        name: "Sara Nawaz",
        password: "123456"
    },
    {
        username: "noor123",
        email: "noor.chaudhry73@gmail.com",
        name: "Noor Chaudhry",
        password: "123456"
    },
    {
        username: "asad123",
        email: "asad.javed92@gmail.com",
        name: "Asad Javed",
        password: "123456"
    },
    {
        username: "mariam123",
        email: "mariam.javed20@gmail.com",
        name: "Mariam Javed",
        password: "123456"
    },
    {
        username: "umar123",
        email: "umar.qureshi68@gmail.com",
        name: "Umar Qureshi",
        password: "123456"
    },
    {
        username: "kashif123",
        email: "kashif.mirza21@gmail.com",
        name: "Kashif Mirza",
        password: "123456"
    },
    {
        username: "hamza123",
        email: "hamza.siddiqui52@gmail.com",
        name: "Hamza Siddiqui",
        password: "123456"
    }
];

async function main() {
    console.log("Start seeding...");

    // Create users data
    console.log("Creating users...");
    await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });
    console.log("Users created successfully.");

    // Fetch all users to get their IDs
    const createdUsers = await prisma.user.findMany({
        select: {
            id: true,
        },
    });

    const userIds = createdUsers.map(user => user.id);
    
    // Hardcoded user ID to be followed by all and to follow 7 others
    const targetUserId = "cmeod0ezo0000ufe00kj2b91r";

    // Filter out the target user from the list
    const otherUserIds = userIds.filter(id => id !== targetUserId);

    // Create follow data where all seeded users follow the target user
    console.log("Creating follow relationships...");
    const followAllData = otherUserIds.map(followerId => ({
        followerId: followerId,
        followingId: targetUserId,
    }));
    await prisma.follow.createMany({
        data: followAllData,
        skipDuplicates: true,
    });

    // Create follow data where the target user follows 7 other users
    const follow7Data = otherUserIds.slice(0, 7).map(followingId => ({
        followerId: targetUserId,
        followingId: followingId,
    }));
    await prisma.follow.createMany({
        data: follow7Data,
        skipDuplicates: true,
    });
    console.log("Follow relationships created successfully.");

    // Create posts data
    console.log("Creating posts...");
    const postsData = [
        {
            userId: userIds[0],
            caption: "Nature's beauty at its finest. 🌳",
            media: {
                create: [
                    {
                        url: "https://ik.imagekit.io/ikmedia/woman-2849887_1280.jpg",
                        fileId: "woman-2849887_1280.jpg",
                        type: "image",
                    },
                ],
            },
        },
        {
            userId: userIds[1],
            caption: "Exploring new places. What a view! 🏞️",
            media: {
                create: [
                    {
                        url: "https://ik.imagekit.io/ikmedia/ocean-1960205_1280.jpg",
                        fileId: "ocean-1960205_1280.jpg",
                        type: "image",
                    },
                ],
            },
        },
        {
            userId: userIds[2],
            caption: "Just another day at the office. 💻",
            media: {
                create: [
                    {
                        url: "https://ik.imagekit.io/ikmedia/office-1296613_1280.jpg",
                        fileId: "office-1296613_1280.jpg",
                        type: "image",
                    },
                ],
            },
        },
        {
            userId: userIds[3],
            caption: "Home sweet home. 🏠",
            media: {
                create: [
                    {
                        url: "https://ik.imagekit.io/ikmedia/home-5692695_1280.jpg",
                        fileId: "home-5692695_1280.jpg",
                        type: "image",
                    },
                ],
            },
        },
    ];

    const createdPosts = [];
    for (const post of postsData) {
        const newPost = await prisma.post.create({
            data: post,
            include: { media: true },
        });
        createdPosts.push(newPost);
    }
    console.log("Posts created successfully.");

    // Create like data
    console.log("Creating likes...");
    if (createdPosts.length > 0) {
        const likeData = [
            {
                userId: userIds[0],
                postId: createdPosts[1].id,
            },
            {
                userId: userIds[1],
                postId: createdPosts[0].id,
            },
            {
                userId: userIds[2],
                postId: createdPosts[0].id,
            },
            {
                userId: userIds[3],
                postId: createdPosts[2].id,
            },
            {
                userId: userIds[4],
                postId: createdPosts[3].id,
            },
        ];
        await prisma.like.createMany({
            data: likeData,
            skipDuplicates: true,
        });
        console.log("Likes created successfully.");
    }
    
    console.log("Seeding finished.");
}

// Execute the main function and handle any errors
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });