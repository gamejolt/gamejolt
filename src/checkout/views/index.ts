import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { routeCheckout } from './checkout/checkout.route';

const routes = [routeCheckout];
export const router = initRouter(routes);
