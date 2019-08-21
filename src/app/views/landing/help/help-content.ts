import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { LocationRedirect } from '../../../../utils/router';
import { importContext } from '../../../../utils/utils';
import { PayloadError } from '../../../../_common/payload/payload-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';

// We don't emit files since we just want to pull the directory listing.
const paths = importContext(
	require.context('!file-loader?-emitFile!../../../../lib/doc-help/src/', true, /\.md$/)
);

@Component({
	name: 'RouteLandingHelp',
})
@RouteResolver({
	async resolver({ route }) {
		// First check the path as is, then check with "index".
		let path = route.params.path;
		if (!path) {
			return new LocationRedirect({ name: 'home' });
		}

		if (paths[`./${path}.md`]) {
			return (await import(
				/* webpackChunkName: "helpContent" */
				`../../../../lib/doc-help/src/${path}.md`
			)).default;
		} else if (paths[`./${path}/index.md`]) {
			return (await import(
				/* webpackChunkName: "helpContent" */
				`../../../../lib/doc-help/src/${path}/index.md`
			)).default;
		}

		return PayloadError.fromHttpError(404);
	},
})
export default class RouteLandingHelp extends BaseRouteComponent {
	content = '';

	get routeTitle() {
		let title = this.$gettext(`Help Docs`);

		// We try to pull the first h1 for the title of the page.
		const matches = this.content.match(/<h1([^>]*)>(.*?)<\/h1>/);
		if (matches) {
			title = `${matches[2]} - ${title}`;
		}

		return title;
	}

	routeResolved($payload: any) {
		this.content = $payload;
	}

	render(h: CreateElement) {
		return h('div', { domProps: { innerHTML: this.content } });
	}
}
