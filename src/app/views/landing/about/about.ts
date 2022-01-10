import { Options } from 'vue-property-decorator';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { imageJolt } from '../../../img/images';
import profileCros from './cros.jpg';
import profileThoro from './thoro.jpg';

@Options({
	name: 'RouteLandingAbout',
	components: {
		AppThemeSvg,
		AppContactLink,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteLandingAbout extends BaseRouteComponent {
	readonly assetUrls = import.meta.globEager('./*.png');
	readonly Screen = Screen;
	readonly imageJolt = imageJolt;
	readonly profileCros = profileCros;
	readonly profileThoro = profileThoro;

	colors = {
		'#ccff00': 'black',
		'#2f7f6f': 'white',
		'#31d6ff': 'white',
		'#ff3fac': 'white',
	};

	disableRouteTitleSuffix = true;

	get routeTitle() {
		return this.$gettext(`About Game Jolt`);
	}
}
