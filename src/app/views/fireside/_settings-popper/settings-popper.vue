<script lang="ts">
import { Emit, Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { FiresideCommunity } from '../../../../_common/fireside/community/community.model';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { Popper } from '../../../../_common/popper/popper.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import { CommunityEjectFiresideModal } from '../../../components/community/eject-fireside/modal/modal.service';
import {
	copyFiresideLink,
	extinguishFireside,
	publishFireside,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { CohostManageModal } from '../cohost/manage/manage-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import { FiresideEditModal } from '../_edit-modal/edit-modal.service';

@Options({
	components: {
		AppPopper,
		AppCommunityThumbnailImg,
	},
})
export default class AppFiresideSettingsPopper extends Vue {
	c = shallowSetup(() => useFiresideController()!);

	@Emit('show') emitShow() {}
	@Emit('hide') emitHide() {}

	get fireside() {
		return this.c.fireside;
	}

	get canEdit() {
		return this.c.canEdit.value;
	}

	get manageableCommunities() {
		if (!this.fireside) {
			return [];
		}

		return this.fireside.community_links.filter(i =>
			i.community.hasPerms('community-firesides')
		);
	}

	get shouldShowStreamSettings() {
		return this.c.shouldShowStreamingOptions.value;
	}

	get hasMuteControls() {
		if (!this.c.rtc.value) {
			return false;
		}
		// Accessing `_users` here instead of `users` so we don't count
		// ourselves.
		return this.c.rtc.value._users.length > 0;
	}

	get isStreaming() {
		return this.c.isPersonallyStreaming.value;
	}

	get shouldMute() {
		return this.c.rtc.value?.users.some(i => !i.micAudioMuted) ?? false;
	}

	muteAll() {
		return this.c.rtc.value?.users.forEach(i => setAudioPlayback(i, false));
	}

	unmuteAll() {
		return this.c.rtc.value?.users.forEach(i => setAudioPlayback(i, true));
	}

	onClickShowChatMembers() {
		if (!this.c.chatUsers.value || !this.c.chatRoom.value) {
			return;
		}

		FiresideChatMembersModal.show(this.c.chatUsers.value, this.c.chatRoom.value);
	}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onClickEditFireside() {
		FiresideEditModal.show(this.c);
	}

	onClickManageCohosts() {
		CohostManageModal.show(this.c);
	}

	onClickPublish() {
		publishFireside(this.c);
	}

	onClickCopyLink() {
		copyFiresideLink(this.c, this.$router);
	}

	onClickStopStreaming() {
		if (!this.c.rtc.value?.producer) {
			return;
		}

		Popper.hideAll();
		stopStreaming(this.c.rtc.value.producer);
	}

	onClickExtinguish() {
		extinguishFireside(this.c);
	}

	onClickReport() {
		ReportModal.show(this.fireside);
	}

	async toggleFeatured(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const isFeaturing = !community.isFeatured;
		try {
			if (isFeaturing) {
				await this.fireside.$feature();
			} else {
				await this.fireside.$unfeature();
			}
		} catch (_) {
			showErrorGrowl({
				message: isFeaturing
					? this.$gettext('Something went wrong while featuring this fireside...')
					: this.$gettext('Something went wrong while unfeaturing this fireside...'),
			});
		}
	}

	async ejectFireside(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const result = await CommunityEjectFiresideModal.show(community, this.fireside);
		if (!result) {
			return;
		}

		try {
			const response = await Api.sendRequest(
				`/web/communities/manage/eject-fireside/${community.id}`,
				result
			);
			if (response.fireside) {
				this.fireside.assign(response.fireside);
			}
		} catch (_) {
			showErrorGrowl({
				message: this.$gettext('Something went wrong while ejecting this fireside...'),
			});
		}
	}
}
</script>

<template>
	<AppPopper popover-class="fill-darkest" @show="emitShow" @hide="emitHide">
		<slot />

		<template #popover>
			<div class="list-group list-group-dark">
				<a
					v-if="!fireside.is_draft"
					class="list-group-item has-icon"
					@click="onClickCopyLink"
				>
					<AppJolticon icon="link" />
					<AppTranslate>Copy Link</AppTranslate>
				</a>

				<template v-if="hasMuteControls">
					<a v-if="shouldMute" class="list-group-item" @click="muteAll()">
						<AppJolticon icon="audio-mute" />
						<AppTranslate>Mute All Users</AppTranslate>
					</a>
					<a v-else class="list-group-item" @click="unmuteAll()">
						<AppJolticon icon="audio" />
						<AppTranslate>Unmute All Users</AppTranslate>
					</a>
				</template>

				<a class="list-group-item has-icon" @click="onClickShowChatMembers">
					<AppJolticon icon="users" />
					<AppTranslate>Chat Members</AppTranslate>
				</a>

				<a v-if="c.canReport.value" class="list-group-item has-icon" @click="onClickReport">
					<AppJolticon icon="flag" />
					<AppTranslate>Report Fireside</AppTranslate>
				</a>

				<a v-if="canEdit" class="list-group-item has-icon" @click="onClickEditFireside">
					<AppJolticon icon="edit" />
					<AppTranslate>Edit Fireside</AppTranslate>
				</a>

				<a
					v-if="c.canManageCohosts.value"
					class="list-group-item has-icon"
					@click="onClickManageCohosts"
				>
					<AppJolticon icon="friends" />
					<AppTranslate>Manage Hosts</AppTranslate>
				</a>

				<template v-if="shouldShowStreamSettings">
					<a class="list-group-item has-icon" @click="onClickEditStream">
						<AppJolticon icon="broadcast" />
						<AppTranslate v-if="isStreaming">Stream Settings</AppTranslate>
						<AppTranslate v-else>Start Stream / Voice Chat</AppTranslate>
					</a>
				</template>

				<template v-if="c.canPublish.value">
					<hr />
					<a class="list-group-item has-icon" @click="onClickPublish">
						<AppJolticon icon="notifications" highlight />
						<AppTranslate>Publish Fireside</AppTranslate>
					</a>
				</template>

				<template v-if="isStreaming || c.canExtinguish.value">
					<hr />

					<a
						v-if="isStreaming"
						class="list-group-item has-icon"
						@click="onClickStopStreaming"
					>
						<AppJolticon icon="plug" notice />
						<AppTranslate>Stop Streaming</AppTranslate>
					</a>

					<a
						v-if="c.canExtinguish.value"
						class="list-group-item has-icon"
						@click="onClickExtinguish"
					>
						<AppJolticon icon="remove" notice />
						<AppTranslate>Extinguish Fireside</AppTranslate>
					</a>
				</template>

				<template v-if="!fireside.is_draft">
					<div v-for="i in manageableCommunities" :key="i.id">
						<hr />

						<h5 class="-extras-header list-group-item has-icon">
							<AppCommunityThumbnailImg :community="i.community" />
							{{ i.community.name }}
						</h5>

						<!-- DISABLED_ALLOW_FIRESIDES -->
						<!-- <a class="list-group-item has-icon" @click="toggleFeatured(i)">
							<AppJolticon icon="star" />

							<AppTranslate v-if="i.isFeatured"> Unfeature fireside </AppTranslate>
							<AppTranslate v-else>Feature fireside</AppTranslate>
						</a> -->

						<a class="list-group-item has-icon" @click="ejectFireside(i)">
							<AppJolticon icon="eject" />

							<AppTranslate>Eject fireside</AppTranslate>
						</a>
					</div>
				</template>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.-extras-header
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	margin-top: 0
	margin-bottom: 0

	img
		width: $list-group-icon-width * 0.8
		height: $list-group-icon-width * 0.8
		border-radius: 50%
		display: inline-block
		position: relative
		left: -($list-group-icon-width - 1px)
		top: -2px
		margin-right: -($list-group-icon-width - 5px)
</style>
