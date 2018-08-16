import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeUpgrade } from './upgrade/upgrade.route';

const routes = [routeUpgrade];
export const router = initRouter(routes);
