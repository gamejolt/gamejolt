<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { FiresideCommunity } from '../../../_common/fireside/community/community.model';
import { stopStreaming } from '../../../_common/fireside/rtc/producer';
import { setMicAudioPlayback } from '../../../_common/fireside/rtc/user';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { Popper } from '../../../_common/popper/popper.service';
import AppPopper from '../../../_common/popper/popper.vue';
import { ReportModal } from '../../../_common/report/modal/modal.service';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { CommunityEjectFiresideModal } from '../../components/community/eject-fireside/modal/modal.service';
import {
	copyFiresideLink,
	extinguishFireside,
	publishFireside,
	useFiresideController,
} from '../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../components/fireside/stream/setup/setup-modal.service';
import { CohostManageModal } from './cohost/manage/manage-modal.service';
import { FiresideChatMembersModal } from './_chat-members/modal/modal.service';
import { FiresideEditModal } from './_edit-modal/edit-modal.service';

const emit = defineEmits({
	show: () => true,
	hide: () => true,
});

const router = useRouter();

const c = useFiresideController()!;
const {
	shouldShowStreamingOptions,
	rtc,
	canEdit,
	isPersonallyStreaming,
	chatUsers,
	chatRoom,
	canReport,
	canManageCohosts,
	canPublish,
	canExtinguish,
} = c;

const fireside = computed(() => c.fireside);

const manageableCommunities = computed(() =>
	fireside.value?.community_links.filter(i => i.community.hasPerms('community-firesides') || [])
);

const hasMuteControls = computed(() => {
	if (!rtc.value) {
		return false;
	}

	// We only want to show mute controls for remote listable streaming users.
	const remoteUsers = rtc.value.listableStreamingUsers.filter(
		rtcUser => !rtcUser.isLocal && (rtcUser.remoteVideoUser || rtcUser.remoteChatUser)
	);
	return remoteUsers.length > 0;
});

const shouldShowMuteAll = computed(() => {
	if (!rtc.value) {
		return false;
	}

	return !rtc.value.isEveryRemoteListableUsersMuted;
});

function muteAll() {
	return rtc.value?.listableStreamingUsers.forEach(i => setMicAudioPlayback(i, false));
}

function unmuteAll() {
	return rtc.value?.listableStreamingUsers.forEach(i => setMicAudioPlayback(i, true));
}

function onClickShowChatMembers() {
	if (!chatUsers.value || !chatRoom.value) {
		return;
	}

	FiresideChatMembersModal.show(chatUsers.value, chatRoom.value);
}

function onClickEditStream() {
	StreamSetupModal.show(c);
}

function onClickEditFireside() {
	FiresideEditModal.show(c);
}

function onClickManageCohosts() {
	CohostManageModal.show(c);
}

function onClickPublish() {
	publishFireside(c);
}

function onClickCopyLink() {
	copyFiresideLink(c, router);
}

function onClickStopStreaming() {
	if (!rtc.value?.producer) {
		return;
	}

	Popper.hideAll();
	stopStreaming(rtc.value.producer);
}

function onClickExtinguish() {
	extinguishFireside(c);
}

function onClickReport() {
	ReportModal.show(fireside.value);
}

// DISABLED_ALLOW_FIRESIDES
// async function toggleFeatured(community: FiresideCommunity) {
// 	Popper.hideAll();
// 	if (!community.community.hasPerms('community-firesides')) {
// 		return;
// 	}

// 	const isFeaturing = !community.isFeatured;
// 	try {
// 		if (isFeaturing) {
// 			await fireside.value.$feature();
// 		} else {
// 			await fireside.value.$unfeature();
// 		}
// 	} catch (_) {
// 		showErrorGrowl({
// 			message: isFeaturing
// 				? $gettext('Something went wrong while featuring this fireside...')
// 				: $gettext('Something went wrong while unfeaturing this fireside...'),
// 		});
// 	}
// }

async function ejectFireside(community: FiresideCommunity) {
	Popper.hideAll();
	if (!community.community.hasPerms('community-firesides')) {
		return;
	}

	const result = await CommunityEjectFiresideModal.show(community, fireside.value);
	if (!result) {
		return;
	}

	try {
		const response = await Api.sendRequest(
			`/web/communities/manage/eject-fireside/${community.id}`,
			result
		);
		if (response.fireside) {
			fireside.value.assign(response.fireside);
		}
	} catch (_) {
		showErrorGrowl({
			message: $gettext('Something went wrong while ejecting this fireside...'),
		});
	}
}
</script>

<template>
	<AppPopper popover-class="fill-darkest" @show="() => emit('show')" @hide="() => emit('hide')">
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
					<a v-if="shouldShowMuteAll" class="list-group-item" @click="muteAll()">
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

				<a v-if="canReport" class="list-group-item has-icon" @click="onClickReport">
					<AppJolticon icon="flag" />
					<AppTranslate>Report Fireside</AppTranslate>
				</a>

				<a v-if="canEdit" class="list-group-item has-icon" @click="onClickEditFireside">
					<AppJolticon icon="edit" />
					<AppTranslate>Edit Fireside</AppTranslate>
				</a>

				<a
					v-if="canManageCohosts"
					class="list-group-item has-icon"
					@click="onClickManageCohosts"
				>
					<AppJolticon icon="friends" />
					<AppTranslate>Manage Hosts</AppTranslate>
				</a>

				<template v-if="shouldShowStreamingOptions">
					<a class="list-group-item has-icon" @click="onClickEditStream">
						<AppJolticon icon="broadcast" />
						<AppTranslate v-if="isPersonallyStreaming">Stream Settings</AppTranslate>
						<AppTranslate v-else>Start Stream / Voice Chat</AppTranslate>
					</a>
				</template>

				<template v-if="canPublish">
					<hr />
					<a class="list-group-item has-icon" @click="onClickPublish">
						<AppJolticon icon="notifications" highlight />
						<AppTranslate>Publish Fireside</AppTranslate>
					</a>
				</template>

				<template v-if="isPersonallyStreaming || canExtinguish">
					<hr />

					<a
						v-if="isPersonallyStreaming"
						class="list-group-item has-icon"
						@click="onClickStopStreaming"
					>
						<AppJolticon icon="plug" notice />
						<AppTranslate>Stop Streaming</AppTranslate>
					</a>

					<a
						v-if="canExtinguish"
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

						<div class="-extras-header">
							<div class="-extras-header-img">
								<AppCommunityThumbnailImg :community="i.community" />
							</div>
							{{ i.community.name }}
						</div>

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
	display: flex
	align-items: center
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	padding: $list-group-item-padding
	padding-left: 0

.-extras-header-img
	width: 20px
	height: 20px
	margin-left: $list-group-item-padding
	margin-right: $list-group-item-padding
</style>
