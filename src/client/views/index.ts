import { initRouter } from '../../utils/router';
import { routeUpgrade } from './upgrade/upgrade.route';

const routes = [routeUpgrade];
export const router = initRouter(routes);
