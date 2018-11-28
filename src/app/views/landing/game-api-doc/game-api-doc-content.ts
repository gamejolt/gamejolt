import { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { PayloadError } from '../../../../lib/gj-lib-client/components/payload/payload-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { importContext } from '../../../../lib/gj-lib-client/utils/utils';

// We don't emit files since we just want to pull the directory listing.
const paths = importContext(
	require.context('!file-loader?-emitFile!../../../../lib/doc-game-api/v1.x/', true, /\.md$/)
);

@Component({
	name: 'RouteLandingGameApiDoc',
})
@RouteResolver({
	async resolver({ route }) {
		// First check the path as is, then check with "index".
		let path = route.params.path;
		if (!path) {
			path = 'index';
		}

		if (paths[`./${path}.md`]) {
			return (await import(/* webpackChunkName: "gameApiDocContent" */
			`../../../../lib/doc-game-api/v1.x/${path}.md`)).default;
		} else if (paths[`./${path}/index.md`]) {
			return (await import(/* webpackChunkName: "gameApiDocContent" */
			`../../../../lib/doc-game-api/v1.x/${path}/index.md`)).default;
		}

		return PayloadError.fromHttpError(404);
	},
})
export default class RouteLandingGameApiDoc extends BaseRouteComponent {
	@Prop(String)
	path!: string;

	content = '';

	routeResolved($payload: any) {
		this.content = $payload;
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: this.content } });
	}
}
