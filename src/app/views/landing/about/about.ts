import { Component } from 'vue-property-decorator';
import { importContext } from '../../../../utils/utils';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Component({
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
	readonly assetUrls = importContext(require.context('./', false, /\.png$/));
	readonly Screen = Screen;

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
