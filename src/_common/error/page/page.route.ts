import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';
import { AppMutation, AppStore } from '../../../vue/services/app/app-store';

// Just a placeholder that sets the 404 error state.
@Component({
	// Explicitly set the name since we rely on it when checking if a route is known by a section router.
	// If it returns a route whose name is RouteError404 the url is not considered to be part of the router.
	name: 'RouteError404',
})
export class RouteError404 extends Vue {
	@AppMutation setError!: AppStore['setError'];

	created() {
		this.setError(404);
	}

	render(h: CreateElement) {
		return h('div');
	}
}

export const routeError404: RouteConfig = {
	name: 'error.404',
	path: '*',
	component: RouteError404,
};
