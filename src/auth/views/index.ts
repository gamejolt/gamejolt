import { routeAuth } from '~auth/views/auth/auth.route';
import { initRouter } from '~utils/router';

export function createAuthRouter() {
	return initRouter([routeAuth]);
}
