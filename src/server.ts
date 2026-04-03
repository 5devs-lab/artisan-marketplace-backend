import app from './app.js';
import connectDB from './config/db.js';
import config from './config/env.js';

// Connect to database
connectDB();

const PORT = config.PORT;

app.listen(PORT, async () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
