<script lang="ts">
import { RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppPageHeader from '../../../components/page-header/AppPageHeader.vue';
import butterfliesImage from './butterflies.png';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<div>
		<AppPageHeader class="forum-header-landing">
			<div :class="{ 'text-center': Screen.isXs }">
				<h1>
					{{ $gettext(`Game Jolt Forums`) }}
				</h1>
				<img
					class="forum-header-landing-mascot"
					:src="butterfliesImage"
					width="218"
					height="146"
					alt="The Social Butterflies"
				/>
			</div>

			<template #nav>
				<nav class="platform-list inline">
					<ul>
						<li>
							<RouterLink
								:to="{ name: 'forums.landing.overview' }"
								:class="{ active: $route.name === 'forums.landing.overview' }"
							>
								{{ $gettext(`Overview`) }}
							</RouterLink>
						</li>
					</ul>
				</nav>
			</template>
		</AppPageHeader>

		<RouterView />
	</div>
</template>

<style lang="stylus" scoped>
.forum-header-landing
	position: relative

	@media $media-xs
		&-mascot
			margin-top: $line-height-computed
			display: inline-block

	@media $media-sm-up
		&-mascot
			position: absolute
			right: 0
			bottom: -65px
</style>
