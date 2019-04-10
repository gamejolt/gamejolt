import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppThemeSvg } from 'game-jolt-frontend-lib/components/theme/svg/svg';
import { importContext } from 'game-jolt-frontend-lib/utils/utils';
import { Component } from 'vue-property-decorator';


@Component({
	name: 'RouteLandingAbout',
	components: {
		AppThemeSvg,
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
}
