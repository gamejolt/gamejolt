import { initRouter } from '../../utils/router';
import { routeCheckout } from './checkout/checkout.route';

const routes = [routeCheckout];
export const router = initRouter(routes);
