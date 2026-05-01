import { initRouter } from '~utils/router';
import { routeContent } from '~z/views/content/content.route';

export function createZRouter() {
	return initRouter([routeContent]);
}
