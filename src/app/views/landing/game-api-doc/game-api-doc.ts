import { Component } from 'vue-property-decorator';
import View from '!view!./game-api-doc.html?style=./game-api-doc.styl';

import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import * as nav from '!json-loader!../../../../lib/doc-game-api/v1.x/nav.json';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

@View
@Component({
	name: 'RouteLandingGameApiDoc',
	components: {
		AppThemeSvg,
	},
})
export default class RouteLandingGameApiDoc extends BaseRouteComponent {
	nav = nav;

	get routeTitle() {
		return this.$gettext(`Game API Documentation`);
	}

	inPath(url: string, exact = false) {
		if (exact) {
			return '/' + this.$route.params.path === url;
		}
		return ('/' + this.$route.params.path).indexOf(url) !== -1;
	}
}
