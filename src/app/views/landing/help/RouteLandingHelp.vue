<script lang="ts">
import { computed } from '@vue/reactivity';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { imageJolt } from '../../../img/images';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`Help Docs`)),
});
</script>

<template>
	<section class="section landing-header">
		<div class="container">
			<h1 class="_header">
				<RouterLink
					:to="{
						name: 'landing.help',
					}"
				>
					<div class="row">
						<div class="col-lg-11">
							<AppThemeSvg
								class="_header-icon"
								:src="imageJolt"
								:width="17 * (Screen.isMobile ? 2 : 3)"
								:height="18 * (Screen.isMobile ? 2 : 3)"
								strict-colors
							/>

							{{ $gettext(`Help Docs`) }}
						</div>
					</div>
				</RouterLink>
			</h1>
		</div>
	</section>

	<router-view />
</template>

<style lang="stylus" scoped>
._header
	@media $media-md-down
		margin-top: 16px

._header > a
	color: var(--theme-fg)

._header-icon
	margin-right: 16px

	@media $media-md-up
		margin-right: 32px
</style>
