<script lang="ts">
import { touchUser } from '../../../_common/user/user.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../_common/route/route-component';

export default {
	name: 'RouteStyleguide',
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import AppButtonStyleguide from '../../../_common/button/AppButtonStyleguide.vue';
import AppJolticonsStyleguide from '../../../_common/jolticons/AppJolticonsStyleguide.vue';
import AppListGroupStyleguide from '../../../_common/list-group/AppListGroupStyleguide.vue';
import AppProgressBarStyleguide from '../../../_common/progress/AppProgressBarStyleguide.vue';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { vAppScrollTo } from '../../../_common/scroll/to/to.directive';
import AppThemeSvgStyleguide from '../../../_common/theme/svg/AppThemeSvgStyleguide.vue';
import AppAvatarFrameStyleguide from './avatar-frame/AppAvatarFrameStyleguide.vue';
import AppStyleguideColor from './color/AppStyleguideColor.vue';

const nav = {
	buttons: 'Buttons',
	'list-groups': 'List Groups',
	'progress-bars': 'Progress Bars',
	colors: 'Colors',
	'theme-svg': 'Theme SVG',
	'avatar-frame': 'Avatar Frame',
	jolticons: 'Jolticons',
};

const components = [
	AppButtonStyleguide,
	AppListGroupStyleguide,
	AppProgressBarStyleguide,
	AppStyleguideColor,
	AppThemeSvgStyleguide,
	AppAvatarFrameStyleguide,
	AppJolticonsStyleguide,
];

createAppRoute({
	routeTitle: computed(() => 'Styleguide'),
});
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
