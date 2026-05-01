import { routeCheckout } from '~checkout/views/checkout/checkout.route';
import { initRouter } from '~utils/router';

export function createCheckoutRouter() {
	return initRouter([routeCheckout]);
}
