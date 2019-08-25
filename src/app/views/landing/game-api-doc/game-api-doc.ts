import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { Component } from 'vue-property-decorator';
import nav from '../../../../lib/doc-game-api/v1.x/nav.json';

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
