<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Provide, Vue } from 'vue-property-decorator';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { useAppStore } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppCommunitiesViewCard from '../_card/card.vue';
import AppNavChannels from '../_nav/channels/channels.vue';
import AppNavEdit from '../_nav/edit/edit.vue';

@Options({
	components: {
		AppCommunitiesViewCard,
		AppNavChannels,
		AppNavEdit,
	},
})
export default class AppCommunitiesViewContext extends Vue {
	@Prop({ type: Object, required: true })
	@Provide({ to: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	store = setup(() => useAppStore());

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	onChangeSection(path: string) {
		// If changing channels, hide the left pane/context sidebar.
		if (this.$route.path !== path) {
			this.store.toggleLeftPane();
		}
	}
}
</script>

<template>
	<div v-if="routeStore.isLoaded" class="sidebar-context-channels">
		<div class="-card">
			<AppCommunitiesViewCard overflow />
		</div>

		<AppNavChannels v-if="!isEditing" />
		<AppNavEdit v-else @change-section="onChangeSection" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../../../../components/community/channel/card/variables'

.sidebar-context-channels
	padding: var(--shell-content-sidebar-padding)

	@media $media-sm-up
		padding-right: 0

	> .-card
		max-width: $card-width
</style>
