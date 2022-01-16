<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppCardListItem from '../../../../../../../../_common/card/list/item/item.vue';
import { CommunityChannel } from '../../../../../../../../_common/community/channel/channel.model';
import { AppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import { CommunityRemoveChannelModal } from '../../../../../../../components/community/remove-channel/modal/modal.service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../view.store';

@Options({
	components: {
		AppCardListItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitiesEditChannelListItem extends Vue {
	@Prop({ type: Object, required: true }) channel!: CommunityChannel;

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get canRemoveChannel() {
		// Cannot remove when no channel perms
		if (!this.community.hasPerms('community-channels')) {
			return false;
		}

		// Draft channels can always be removed because they don't count towards the active channels.
		if (this.channel.visibility === 'draft') {
			return true;
		}

		// Same as Draft channels, archived channels don't count towards active channels.
		if (this.channel.is_archived) {
			return true;
		}

		return this.community.canRemoveChannel;
	}

	get canEditChannel() {
		// When it's a competition channel, mods with competition perms can edit.
		if (
			this.channel.type === 'competition' &&
			this.community.hasPerms('community-competitions')
		) {
			return true;
		}

		return this.community.hasPerms('community-channels');
	}

	async onClickRemoveChannel(channel: CommunityChannel) {
		await CommunityRemoveChannelModal.show(this.community, channel);

		if (channel._removed) {
			if (channel.is_archived) {
				this.routeStore.archivedChannels = this.routeStore.archivedChannels.filter(
					i => i.id !== channel.id
				);
			} else {
				this.community.channels = this.community.channels!.filter(i => i.id !== channel.id);
			}
		}
	}
}
</script>

<template>
	<app-card-list-item :item="channel" force-expandable-padding>
		<a
			v-if="canRemoveChannel"
			v-app-tooltip="$gettext(`Remove Channel`)"
			class="card-remove"
			@click.stop="onClickRemoveChannel(channel)"
		>
			<app-jolticon icon="remove" />
		</a>

		<div class="card-title">
			<div>
				<span v-if="channel.type === 'competition'" class="tag">
					<app-jolticon icon="jams" />
					<translate>Game Jam</translate>
				</span>
				<span v-if="channel.visibility === 'draft'" class="tag">
					<translate>Draft</translate>
				</span>
			</div>
			<div>
				<template v-if="channel.hasDisplayTitle">
					<b class="-title">{{ channel.displayTitle }}</b>
					<span class="hidden-xs">&nbsp;</span>
					<br class="visible-xs" />
					<span class="-path text-muted">{{ channel.title }}</span>
				</template>
				<template v-else>
					<b>{{ channel.title }}</b>
				</template>
			</div>
		</div>

		<div v-if="canEditChannel" class="-controls">
			<app-button
				primary
				:to="{
					name: 'communities.view.edit.channels.overview',
					params: { channel: channel.title },
				}"
			>
				<translate>Edit Channel</translate>
			</app-button>
		</div>
	</app-card-list-item>
</template>

<style lang="stylus" scoped>
.-title
.-path
	text-overflow()
	display: inline-block
	max-width: 100%
</style>
