import { initRouter } from '../../utils/router';
import { routeDowngrade } from './downgrade/downgrade.route';
import { routeUpgrade } from './upgrade/upgrade.route';

const routes = [routeDowngrade, routeUpgrade];
export const router = initRouter(routes);
