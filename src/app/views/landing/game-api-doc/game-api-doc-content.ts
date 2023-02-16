import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { ViteMarkdownExport } from '../../../../../typings/markdown';
import { PayloadError } from '../../../../_common/payload/payload-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

const paths = import.meta.glob<ViteMarkdownExport>('../../../../lib/doc-game-api/v1.x/**/*.md');

@Options({
	name: 'RouteLandingGameApiDocContent',
})
@OptionsForRoute({
	async resolver({ route }) {
		console.log(route.params.path);
		// First check the path as is, then check with "index".
		let path = ((route.params.path || []) as string[]).join('/');
		if (!path) {
			path = 'index';
		}

		console.log(paths);

		if (paths[`../../../../lib/doc-game-api/v1.x/${path}.md`]) {
			return (await paths[`../../../../lib/doc-game-api/v1.x/${path}.md`]()).html;
		} else if (paths[`../../../../lib/doc-game-api/v1.x/${path}/index.md`]) {
			return (await paths[`../../../../lib/doc-game-api/v1.x/${path}/index.md`]()).html;
		}

		return PayloadError.fromHttpError(404);
	},
})
export default class RouteLandingGameApiDoc extends BaseRouteComponent {
	content = '';

	get routeTitle() {
		let title = this.$gettext(`Game API Documentation`);

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
