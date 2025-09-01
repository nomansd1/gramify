import { cleanupExpiredStoriesJob } from "./cleanupStories.job.js";

const jobs = [];

export const startCronJobs = () => {
    console.log('Cron jobs starts');
    
    jobs.push(cleanupExpiredStoriesJob());

    return jobs;
};

export const stopCronJobs = () => {
    console.log('Cron jobs shutdown');
    jobs.forEach(job => job.stop());
};