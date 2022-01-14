<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import butterfliesImage from './butterflies.png';

@Options({
	name: 'RouteForumsLanding',
	components: {
		AppPageHeader,
	},
})
export default class RouteForumsLanding extends BaseRouteComponent {
	readonly Screen = Screen;
	readonly butterfliesImage = butterfliesImage;
}
</script>

<template>
	<div>
		<app-page-header class="forum-header-landing">
			<div :class="{ 'text-center': Screen.isXs }">
				<h1>
					<translate>Game Jolt Forums</translate>
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
								<translate>Overview</translate>
							</router-link>
						</li>
						<li>
							<router-link
								:to="{ name: 'forums.landing.active' }"
								active-class="active"
							>
								<translate>Active Topics</translate>
							</router-link>
						</li>
					</ul>
				</nav>
			</template>
		</app-page-header>

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
