import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingHelp',
	components: {
		AppThemeSvg,
	},
})
export default class RouteLandingHelp extends BaseRouteComponent {
	readonly imageJolt = imageJolt;

	get routeTitle() {
		return this.$gettext(`Help Docs`);
	}

	inPath(url: string, exact = false) {
		if (exact) {
			return '/' + this.$route.params.path === url;
		}
		return ('/' + this.$route.params.path).indexOf(url) !== -1;
	}
}
