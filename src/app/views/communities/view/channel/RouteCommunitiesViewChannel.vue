<script lang="ts">
import { defineAsyncComponent, toRef } from 'vue';
import { router } from '../../..';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { getChannelPathFromRoute, useCommunityRouteStore } from '../view.store';

const RouteCommunitiesViewChannelFeed = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteCommunitiesViewChannelFeed.vue'))
);
const RouteCommunitiesViewChannelJam = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteCommunitiesViewChannelJam.vue'))
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
