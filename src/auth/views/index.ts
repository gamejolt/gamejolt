import { initRouter } from '../../utils/router';
import { authStore } from '../store/index';
import { routeAuth } from './auth/auth.route';

const routes = [routeAuth];
export const router = initRouter(routes);

// Check the meta info to hide/show cover images.
router.beforeEach((to, _from) => {
	if (to.matched.some(record => record.meta.hideCoverImage)) {
		authStore.hideCoverImage();
	} else {
		authStore.showCoverImage();
	}
});
