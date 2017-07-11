import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeCheckout } from './checkout/checkout.route';

const routes = [routeCheckout];
export const router = initRouter(routes);
