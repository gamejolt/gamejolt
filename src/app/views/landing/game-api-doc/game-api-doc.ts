import View from '!view!./game-api-doc.html?style=./game-api-doc.styl';
import { Component } from 'vue-property-decorator';
import nav from '../../../../lib/doc-game-api/v1.x/nav.json';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
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
