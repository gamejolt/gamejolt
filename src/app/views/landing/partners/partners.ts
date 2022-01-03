import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingPartners',
	components: {
		AppThemeSvg,
	},
})
export default class RouteLandingPartners extends BaseRouteComponent {
	readonly imageJolt = imageJolt;

	get routeTitle() {
		return `Become a Partner`;
	}
}
