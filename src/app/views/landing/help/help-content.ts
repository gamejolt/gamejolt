import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { RouteLocationRedirect } from '../../../../utils/router';
import { PayloadError } from '../../../../_common/payload/payload-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';

const paths = import.meta.glob('../../../../lib/doc-help/src/**/*.md');

@Options({
	name: 'RouteLandingHelpContent',
})
@RouteResolver({
	async resolver({ route }) {
		// First check the path as is, then check with "index".
		const path = route.params.path;
		if (!path) {
			return new RouteLocationRedirect({ name: 'home' });
		}

		if (paths[`../../../../lib/doc-help/src/${path}.md`]) {
			return (await paths[`../../../../lib/doc-help/src/${path}.md`]()).html;
		} else if (paths[`../../../../lib/doc-help/src/${path}/index.md`]) {
			return (await paths[`../../../../lib/doc-help/src/${path}/index.md`]()).html;
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

	render() {
		return h('div', { innerHTML: this.content });
	}
}
