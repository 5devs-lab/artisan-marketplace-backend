import cron from 'node-cron';
import config from './env.js';

/**
 * Initializes background cron jobs.
 * - Pings the server every 5 minutes to keep it active (prevents sleeping on free tiers).
 */
export const initCronJobs = () => {
  // Only run in production to avoid unnecessary local logs/requests
  if (config.NODE_ENV !== 'production') {
    console.log('Cron jobs are disabled in non-production environments.');
    return;
  }

  console.log('Initializing cron jobs...');

  // Ping the server every 5 minutes
  // Schedule: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    try {
      const healthEndpoint = `${config.SERVER_URL}/api/health`;
      console.log(`[Cron] Pinging server health endpoint: ${healthEndpoint}`);
      
      const response = await fetch(healthEndpoint);
      
      if (response.ok) {
        console.log(`[Cron] Server ping successful: ${response.status}`);
      } else {
        console.error(`[Cron] Server ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('[Cron] Error pinging server:', error instanceof Error ? error.message : error);
    }
  });

  console.log('Cron job [Server Ping] scheduled (every 5 minutes).');
};

export default initCronJobs;
