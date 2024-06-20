<script lang="ts" setup>
import { PropType, computed, provide, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { CommunityChannelCardWidth } from '../../../../components/community/channel/card/AppCommunityChannelCard.vue';
import { useAppStore } from '../../../../store';
import AppCommunitiesViewCard from '../_card/AppCommunitiesViewCard.vue';
import AppNavChannels from '../_nav/channels/AppNavChannels.vue';
import AppNavEdit from '../_nav/edit/AppNavEdit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

const props = defineProps({
	routeStore: {
		type: Object as PropType<CommunityRouteStore>,
		required: true,
	},
});

provide(CommunityRouteStoreKey, props.routeStore);

const { routeStore } = toRefs(props);
const { community, isLoaded: isRouteStoreLoaded } = routeStore.value;
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
	<!--TODO(reactive-community-route-store): community needs to be valid for the whole block?
		AppNavChannels and AppNavEdit will be skipped also if it's not valid, that's expected right?-->
	<div v-if="isRouteStoreLoaded && community" class="sidebar-context-channels">
		<div
			:style="{
				maxWidth: `${CommunityChannelCardWidth}px`,
			}"
		>
			<AppCommunitiesViewCard :community="community" />
		</div>

		<AppNavChannels v-if="!isEditing" :community="community" />
		<AppNavEdit v-else :community="community" @change-section="onChangeSection" />
	</div>
</template>

<style lang="stylus" scoped>
.sidebar-context-channels
	padding: var(--shell-content-sidebar-padding)

	@media $media-sm-up
		padding-right: 0
</style>
