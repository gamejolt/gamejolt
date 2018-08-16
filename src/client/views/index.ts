import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeDowngrade } from './downgrade/downgrade.route';

const routes = [routeDowngrade];
export const router = initRouter(routes);
