import { Component } from 'vue-property-decorator';
import AppButtonStyleguide from '../../../_common/button/button-styleguide.vue';
import AppJolticonsStyleguide from '../../../_common/jolticons/jolticons-styleguide.vue';
import AppListGroupStyleguide from '../../../_common/list-group/list-group-styleguide.vue';
import AppProgressBarStyleguide from '../../../_common/progress/bar/bar-styleguide.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppScrollTo } from '../../../_common/scroll/to/to.directive';
import AppThemeSvgStyleguide from '../../../_common/theme/svg/svg-styleguide.vue';
import { User } from '../../../_common/user/user.model';
import AppVideoPlayerStyleguide from '../../../_common/video/player/player-styleguide.vue';
import AppStyleguideColor from './color/color.vue';

@Component({
	name: 'RouteStyleguide',
	components: {
		AppScrollAffix,
		AppButtonStyleguide,
		AppListGroupStyleguide,
		AppProgressBarStyleguide,
		AppStyleguideColor,
		AppThemeSvgStyleguide,
		AppJolticonsStyleguide,
		AppVideoPlayerStyleguide,
	},
	directives: {
		AppScrollTo,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteStyleguide extends BaseRouteComponent {
	get routeTitle() {
		return 'Styleguide';
	}

	get nav() {
		return {
			buttons: 'Buttons',
			'list-groups': 'List Groups',
			'progress-bars': 'Progress Bars',
			colors: 'Colors',
			'theme-svg': 'Theme SVG',
			jolticons: 'Jolticons',
			'video-player': 'Video Player',
		};
	}

	get components() {
		return [
			AppVideoPlayerStyleguide,
			AppButtonStyleguide,
			AppListGroupStyleguide,
			AppProgressBarStyleguide,
			AppStyleguideColor,
			AppThemeSvgStyleguide,
			AppJolticonsStyleguide,
		];
	}
}
