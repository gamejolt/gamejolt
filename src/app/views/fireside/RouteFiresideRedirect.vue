<script lang="ts">
import { computed } from 'vue';
import { RouteLocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import { Fireside } from '../../../_common/fireside/fireside.model';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { $gettext } from '../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		lazy: true,
		resolver: async ({ route }) => {
			const payload = await Api.sendFieldsRequest(
				`/mobile/fireside/for-user/@${route.params.username}`,
				{
					fireside: true,
				}
			);

			// No active fireside, just go to their profile.
			if (!payload.fireside) {
				return new RouteLocationRedirect({
					name: 'profile.overview',
					params: {
						username: route.params.username,
					},
					query: {
						// This tells the profile to show a "fireside" related
						// modal.
						fireside: null,
					},
				});
			}

			const fireside = new Fireside(payload.fireside);

			return new RouteLocationRedirect({
				name: 'fireside',
				params: {
					hash: fireside.hash,
				},
			});
		},
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`Redirecting...`)),
});
</script>

<template>
	<div class="-container">
		<AppLoading />
	</div>
</template>

<style lang="stylus" scoped>
.-container
	display: flex
	height: calc(100vh - var(--shell-top) - var(--shell-bottom))
	align-items: center
	justify-content: center
</style>
