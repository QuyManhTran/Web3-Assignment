import { CronJob } from 'cron'

export default class CronService {
    scheduleCronJob() {
        // //console.log('Cron job is running...')
        const cronJob = new CronJob('* * * * * *', () => {
            console.log('Cron job is running...')
        })
        cronJob.start()
    }
}
