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