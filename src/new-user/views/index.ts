import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeFlow } from './flow/flow.route';

const routes = [routeFlow];
export const router = initRouter(routes);
