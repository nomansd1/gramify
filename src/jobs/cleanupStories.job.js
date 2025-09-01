import cron from "node-cron";
import prisma from "../db/index.js";
import { deleteFromImageKit } from "../utils/index.js";

export const cleanupExpiredStoriesJob = () => {
    const job = cron.schedule("*/5 * * * *", async () => {
        try {
            const expiredStories = await prisma.story.findMany({
                where: {
                    expiresAt: { lt: new Date() }
                }
            });

            for (const story of expiredStories) {
                if (story.fileId) {
                    await deleteFromImageKit(story.fileId);
                }

                await prisma.story.delete({ where: { id: story.id } });
            }
        } catch (error) {
            console.log("Error while cleaning expired stories: ", err);
        }
    });

    return job;
};