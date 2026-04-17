<script lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import { imageJolt } from '~app/img/images';
import { routeLandingHelpIndex } from '~app/views/landing/help/help.route';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppThemeSvg from '~common/theme/svg/AppThemeSvg.vue';
import { kThemeFg } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`Help Docs`)),
});
</script>

<template>
	<section class="section landing-header text-center">
		<div class="container">
			<h1>
				<RouterLink
					:style="{
						color: kThemeFg,
					}"
					:to="{
						name: routeLandingHelpIndex.name,
					}"
				>
					<AppThemeSvg class="bolt" :src="imageJolt" strict-colors />

					{{ $gettext(`Help Docs`) }}
				</RouterLink>
			</h1>
		</div>
	</section>

	<RouterView />
</template>
