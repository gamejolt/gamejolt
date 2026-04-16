<script lang="ts">
import { defineAsyncComponent, toRef } from 'vue';

import { router } from '~app/views';
import { getChannelPathFromRoute, useCommunityRouteStore } from '~app/views/communities/view/view.store';
import { Api } from '~common/api/api.service';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';

const RouteCommunitiesViewChannelFeed = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('~app/views/communities/view/channel/RouteCommunitiesViewChannelFeed.vue'))
);
const RouteCommunitiesViewChannelJam = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('~app/views/communities/view/channel/RouteCommunitiesViewChannelJam.vue'))
);

/**
 * Route dependencies for channel-type pages.
 */

export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['path', 'channel'] },
		resolver: ({ route }) => {
			const channel = getChannelPathFromRoute(route);
			return Api.sendRequest(`/web/communities/view-channel/${route.params.path}/${channel}`);
		},
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;
const channel = toRef(() => routeStore.channel);

createAppRoute({
	onResolved({ payload }) {
		if (payload.channel) {
			const newChannel = new CommunityChannelModel(payload.channel);
			if (channel.value) {
				channel.value.assign(newChannel);
			} else if (newChannel.is_archived) {
				routeStore.archivedChannels.push(newChannel);
			}
		}
	},
});
</script>

<template>
	<div v-if="channel">
		<RouteCommunitiesViewChannelJam v-if="channel.type === 'competition'" />
		<RouteCommunitiesViewChannelFeed v-else />
	</div>
</template>

<style lang="stylus" scoped>
.-container
	padding-bottom: 0
</style>
