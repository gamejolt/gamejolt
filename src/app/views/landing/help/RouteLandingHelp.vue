<script lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { kThemeFg } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { imageJolt } from '../../../img/images';
import { routeLandingHelp } from './help.route';

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
	<section class="section landing-header text-center">
		<div class="container">
			<h1>
				<RouterLink
					:style="{
						color: kThemeFg,
					}"
					:to="{
						name: routeLandingHelp.name,
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
