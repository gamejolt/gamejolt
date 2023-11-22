<script lang="ts">
import { computed, toRef } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { getChannelPathFromRoute, useCommunityRouteStore } from '../view.store';
import RouteCommunitiesViewChannelFeed from './RouteCommunitiesViewChannelFeed.vue';
import RouteCommunitiesViewChannelJam from './RouteCommunitiesViewChannelJam.vue';

/**
 * Route dependencies for channel-type pages.
 */

export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};
export default {
	...defineAppRouteOptions({
		deps: { params: ['path', 'channel'] },
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
	routeTitle: computed(() => ``),
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
