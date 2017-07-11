import { store } from '../store/index';
import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeAuth } from './auth/auth.route';

const routes = [routeAuth];
export const router = initRouter(routes);

// Check the meta info to hide/show cover images.
router.beforeEach((to, _from, next) => {
	if (to.matched.some(record => record.meta.hideCoverImage)) {
		store.commit('hideCoverImage');
	} else {
		store.commit('showCoverImage');
	}
	next();
});
