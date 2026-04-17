import { routeUpgrade } from '~client/views/upgrade/upgrade.route';
import { initRouter } from '~utils/router';

const routes = [routeUpgrade];
export const router = initRouter(routes);
