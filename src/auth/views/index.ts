import { authStore } from '~auth/store/index';
import { routeAuth } from '~auth/views/auth/auth.route';
import { initRouter } from '~utils/router';

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
