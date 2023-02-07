<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppPageHeader from '../../../components/page-header/AppPageHeader.vue';
import butterfliesImage from './butterflies.png';

@Options({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
@OptionsForRoute()
export default class RouteForumsLanding extends BaseRouteComponent {
	readonly Screen = Screen;
	readonly butterfliesImage = butterfliesImage;
}
</script>

<template>
	<div>
		<AppPageHeader class="forum-header-landing">
			<div :class="{ 'text-center': Screen.isXs }">
				<h1>
					<AppTranslate>Game Jolt Forums</AppTranslate>
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
							<router-link
								:to="{ name: 'forums.landing.overview' }"
								:class="{ active: $route.name === 'forums.landing.overview' }"
							>
								<AppTranslate>Overview</AppTranslate>
							</router-link>
						</li>
					</ul>
				</nav>
			</template>
		</AppPageHeader>

		<router-view />
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
