<script lang="ts" setup>
import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';

import { CommunityChannelCardWidth } from '~app/components/community/channel/card/AppCommunityChannelCard.vue';
import { useAppStore } from '~app/store';
import AppCommunitiesViewCard from '~app/views/communities/view/_card/AppCommunitiesViewCard.vue';
import AppNavChannels from '~app/views/communities/view/_nav/channels/AppNavChannels.vue';
import AppNavEdit from '~app/views/communities/view/_nav/edit/AppNavEdit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '~app/views/communities/view/view.store';
import { isEditingCommunity } from '~common/community/community.model';

type Props = {
	routeStore: CommunityRouteStore;
};
const { routeStore } = defineProps<Props>();

provide(CommunityRouteStoreKey, routeStore);

const { toggleLeftPane } = useAppStore();
const route = useRoute();

const isEditing = computed(() => isEditingCommunity(route));

function onChangeSection(path: string) {
	// If changing channels, hide the left pane/context sidebar.
	if (route.path !== path) {
		toggleLeftPane();
	}
}
</script>

<template>
	<div v-if="routeStore.isLoaded" class="sidebar-context-channels">
		<div
			:style="{
				maxWidth: `${CommunityChannelCardWidth}px`,
			}"
		>
			<AppCommunitiesViewCard />
		</div>

		<AppNavChannels v-if="!isEditing" />
		<AppNavEdit v-else @change-section="onChangeSection" />
	</div>
</template>

<style lang="stylus" scoped>
.sidebar-context-channels
	padding: var(--shell-content-sidebar-padding)

	@media $media-sm-up
		padding-right: 0
</style>
