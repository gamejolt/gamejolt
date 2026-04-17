import { routeCheckout } from '~checkout/views/checkout/checkout.route';
import { initRouter } from '~utils/router';

const routes = [routeCheckout];
export const router = initRouter(routes);
