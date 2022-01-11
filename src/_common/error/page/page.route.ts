import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { RouteRecordRaw } from 'vue-router';
import { useCommonStore } from '../../store/common-store';

// Just a placeholder that sets the 404 error state.
@Options({
	// Explicitly set the name since we rely on it when checking if a route is known by a section router.
	// If it returns a route whose name is RouteError404 the url is not considered to be part of the router.
	name: 'RouteError404',
})
export class RouteError404 extends Vue {
	commonStore = setup(() => useCommonStore());

	created() {
		this.commonStore.setError(404);
	}

	render() {
		return h('div');
	}
}

export const routeError404: RouteRecordRaw = {
	name: 'error.404',
	path: '/:_(.*)',
	component: RouteError404,
};
