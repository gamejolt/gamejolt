import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../../../../utils/array';
import { CommunityChannel } from '../../../../../../../../_common/community/channel/channel.model';
import { Growls } from '../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent } from '../../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../../../_common/scroll/scroll.service';
import FormCommunityChannelDescription from '../../../../../../../components/forms/community/channel/description/description.vue';
import FormCommunityChannelEdit from '../../../../../../../components/forms/community/channel/edit/edit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../view.store';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditChannelsOverview',
	components: {
		FormCommunityChannelEdit,
		AppCommunitiesViewPageContainer,
		FormCommunityChannelDescription,
	},
})
export default class RouteCommunitiesViewEditChannelsOverview extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	readonly Screen = Screen;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get canEditDescription() {
		return this.channel.type === 'competition';
	}

	get canArchive() {
		return (
			!this.channel.is_archived &&
			this.channel.visibility === 'published' &&
			this.community.canRemoveChannel
		);
	}

	get shouldShowArchiveOptions() {
		return (
			this.channel.visibility === 'published' && this.community.hasPerms('community-channels')
		);
	}

	onSubmit(model: CommunityChannel) {
		// After submitting the form, redirect to the edit page with the new title if it changed.
		// The title of the channel is part of the URL.
		if (model.title !== this.$route.params.channel) {
			this.$router.push({ params: { channel: model.title } });
		}
	}

	async onClickArchive() {
		if (!this.canArchive) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettextInterpolate(`Are you sure you want to archive the channel %{ channel }?`, {
				channel: this.channel.displayTitle,
			})
		);

		if (result) {
			const payload = await this.channel.$archive();
			if (payload.success) {
				this.routeStore.archivedChannels.push(this.channel);
				arrayRemove(this.community.channels!, i => i.id === this.channel.id);
				this.community.has_archived_channels = true;

				Growls.success(this.$gettext(`Channel is now archived.`));
				Scroll.to(0);
			}
		}
	}

	async onClickUnarchive() {
		const result = await ModalConfirm.show(
			this.$gettextInterpolate(
				`Are you sure you want to restore the channel %{ channel } from the archive?`,
				{
					channel: this.channel.displayTitle,
				}
			)
		);

		if (result) {
			try {
				await this.channel.$unarchive();
				this.community.channels!.push(this.channel);
				arrayRemove(this.routeStore.archivedChannels, i => i.id === this.channel.id);

				if (this.routeStore.archivedChannels.length === 0) {
					this.community.has_archived_channels = false;
				}

				Growls.success(this.$gettext(`Channel was restored from the archive.`));
				Scroll.to(0);
			} catch (payload) {
				if (payload.errors) {
					if (payload.errors['too_many_channels']) {
						Growls.error(
							this.$gettext(
								`There are too many public channels in this community. Remove or archive another channel before restoring this one.`
							)
						);
					}
				}
			}
		}
	}
}
