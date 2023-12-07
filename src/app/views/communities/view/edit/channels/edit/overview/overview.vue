<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	$archiveCommunityChannel,
	$unarchiveCommunityChannel,
	CommunityChannelModel,
} from '../../../../../../../../_common/community/channel/channel.model';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../../../_common/scroll/scroll.service';
import { arrayRemove } from '../../../../../../../../utils/array';
import FormCommunityChannelDescription from '../../../../../../../components/forms/community/channel/description/FormCommunityChannelDescription.vue';
import FormCommunityChannelEdit from '../../../../../../../components/forms/community/channel/edit/edit.vue';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsOverview',
	components: {
		FormCommunityChannelEdit,
		AppCommunitiesViewPageContainer,
		FormCommunityChannelDescription,
	},
})
@OptionsForLegacyRoute()
export default class RouteCommunitiesViewEditChannelsOverview extends LegacyRouteComponent {
	routeStore = setup(() => useCommunityRouteStore())!;

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

	onSubmit(model: CommunityChannelModel) {
		// After submitting the form, redirect to the edit page with the new title if it changed.
		// The title of the channel is part of the URL.
		if (model.title !== this.$route.params.channel) {
			this.$router.push({ params: { channel: model.title } });
		}
	}

	onBackgroundChange(model: CommunityChannelModel) {
		Object.assign(this.channel, model);
	}

	async onClickArchive() {
		if (!this.canArchive) {
			return;
		}

		const result = await showModalConfirm(
			this.$gettext(`Are you sure you want to archive the channel %{ channel }?`, {
				channel: this.channel.displayTitle,
			})
		);

		if (result) {
			const payload = await $archiveCommunityChannel(this.channel);

			if (payload.success) {
				this.routeStore.archivedChannels.push(this.channel);
				arrayRemove(this.community.channels!, i => i.id === this.channel.id);
				this.community.has_archived_channels = true;

				showSuccessGrowl(this.$gettext(`Channel is now archived.`));
				Scroll.to(0);
			}
		}
	}

	async onClickUnarchive() {
		const result = await showModalConfirm(
			this.$gettext(
				`Are you sure you want to restore the channel %{ channel } from the archive?`,
				{
					channel: this.channel.displayTitle,
				}
			)
		);

		if (result) {
			try {
				await $unarchiveCommunityChannel(this.channel);
				this.community.channels!.push(this.channel);
				arrayRemove(this.routeStore.archivedChannels, i => i.id === this.channel.id);

				if (this.routeStore.archivedChannels.length === 0) {
					this.community.has_archived_channels = false;
				}

				showSuccessGrowl(this.$gettext(`Channel was restored from the archive.`));
				Scroll.to(0);
			} catch (payload) {
				if (payload.errors) {
					if (payload.errors['too_many_channels']) {
						showErrorGrowl(
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
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<div class="row">
			<div class="col-md-8">
				<h2 class="section-header">
					<AppTranslate>Details</AppTranslate>
				</h2>

				<FormCommunityChannelEdit
					:community="community"
					:model="channel"
					@submit="onSubmit"
					@background-change="onBackgroundChange"
				/>

				<template v-if="canEditDescription">
					<h2>
						<AppTranslate>Edit Description</AppTranslate>
					</h2>
					<FormCommunityChannelDescription :model="channel" />
				</template>
			</div>
		</div>
		<template v-if="shouldShowArchiveOptions">
			<section class="section">
				<div class="row">
					<div class="col-md-8">
						<div class="well fill-offset">
							<template v-if="!channel.is_archived">
								<h4 class="section-header">
									<AppTranslate>Archive Channel</AppTranslate>
								</h4>

								<div class="page-help">
									<p>
										<AppTranslate>
											Archiving a channel will hide it from the community's
											channel list and sets it to read-only for all users. Any
											existing posts in the channel will remain there, and the
											channel can still be viewed.
										</AppTranslate>
									</p>
								</div>

								<AppButton :disabled="!canArchive" @click="onClickArchive">
									<AppTranslate>Archive Channel</AppTranslate>
								</AppButton>

								<p v-if="!canArchive" class="help-block sans-margin-bottom">
									<AppTranslate>
										The last public channel cannot be archived.
									</AppTranslate>
								</p>
							</template>

							<template v-else>
								<h4 class="sans-margin-top">
									<AppTranslate>Restore Channel</AppTranslate>
								</h4>

								<div class="page-help">
									<p>
										<AppTranslate>
											Restoring a channel will remove it from the archive and
											make it publicly visible again.
										</AppTranslate>
									</p>
								</div>

								<AppButton @click="onClickUnarchive">
									<AppTranslate>Restore Channel</AppTranslate>
								</AppButton>
							</template>
						</div>
					</div>
				</div>
			</section>
		</template>
	</AppCommunitiesViewPageContainer>
</template>
