<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppButtonStyleguide from '../../../_common/button/button-styleguide.vue';
import AppJolticonsStyleguide from '../../../_common/jolticons/jolticons-styleguide.vue';
import AppListGroupStyleguide from '../../../_common/list-group/list-group-styleguide.vue';
import AppProgressBarStyleguide from '../../../_common/progress/AppProgressBarStyleguide.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../_common/route/legacy-route-component';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { vAppScrollTo } from '../../../_common/scroll/to/to.directive';
import AppThemeSvgStyleguide from '../../../_common/theme/svg/svg-styleguide.vue';
import { touchUser } from '../../../_common/user/user.model';
import AppAvatarFrameStyleguide from './avatar-frame/AppAvatarFrameStyleguide.vue';
import AppStyleguideColor from './color/color.vue';

@Options({
	name: 'RouteStyleguide',
	components: {
		AppScrollAffix,
		AppButtonStyleguide,
		AppListGroupStyleguide,
		AppProgressBarStyleguide,
		AppStyleguideColor,
		AppThemeSvgStyleguide,
		AppJolticonsStyleguide,
	},
	directives: {
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => touchUser(),
})
export default class RouteStyleguide extends LegacyRouteComponent {
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
			'avatar-frame': 'Avatar Frame',
			jolticons: 'Jolticons',
		};
	}

	get components() {
		return [
			AppButtonStyleguide,
			AppListGroupStyleguide,
			AppProgressBarStyleguide,
			AppStyleguideColor,
			AppThemeSvgStyleguide,
			AppAvatarFrameStyleguide,
			AppJolticonsStyleguide,
		];
	}
}
</script>

<template>
	<div class="container">
		<div class="row">
			<div class="col-sm-3 col-sm-push-9 col-lg-2 col-lg-push-10">
				<br />
				<br />
				<AppScrollAffix>
					<nav class="platform-list">
						<ul>
							<li v-for="(label, key) of nav" :key="key">
								<a v-app-scroll-to :href="`#styleguide-${key}`">
									{{ label }}
								</a>
							</li>
						</ul>
					</nav>
				</AppScrollAffix>
			</div>
			<div class="col-sm-9 col-sm-pull-3 col-lg-10 col-lg-pull-2">
				<component :is="component" v-for="(component, key) of components" :key="key" />
			</div>
		</div>
	</div>
</template>
