import server from './server/index.js';
import { startDailyEvaluator } from './utils/startDailyEvaluator.js';

const port = process.env.PORT;
const host = process.env.HOST;

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
  startDailyEvaluator();
});
