import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { importContext } from '../../../../lib/gj-lib-client/utils/utils';
import { PayloadError } from '../../../../lib/gj-lib-client/components/payload/payload-service';

// We don't emit files since we just want to pull the directory listing.
const paths = importContext(
	require.context('!file-loader?-emitFile!../../../../lib/doc-game-api/v1.x/', true, /\.md$/)
);

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteLandingGameApiDoc',
})
export default class RouteLandingGameApiDoc extends BaseRouteComponent {
	@Prop(String) path: string;

	content = '';

	@RouteResolve()
	async routeResolve(this: undefined, route: VueRouter.Route) {
		// First check the path as is, then check with "index".
		let path = route.params.path;
		if (!path) {
			path = 'index';
		}

		if (paths[`./${path}.md`]) {
			return import(/* webpackChunkName: "gameApiDocContent" */
			`../../../../lib/doc-game-api/v1.x/${path}.md`);
		} else if (paths[`./${path}/index.md`]) {
			return import(/* webpackChunkName: "gameApiDocContent" */
			`../../../../lib/doc-game-api/v1.x/${path}/index.md`);
		}

		return PayloadError.fromHttpError(404);
	}

	routed() {
		this.content = this.$payload;
	}

	render(h: Vue.CreateElement) {
		return h('div', { domProps: { innerHTML: this.content } });
	}
}
