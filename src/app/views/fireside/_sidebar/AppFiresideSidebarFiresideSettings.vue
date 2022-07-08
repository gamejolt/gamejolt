<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import AppButton from '../../../../_common/button/AppButton.vue';
import { setMicAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppFiresideSettings from '../../../components/fireside/AppFiresideSettings.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideShare from '../AppFiresideShare.vue';
import AppFiresideSidebar from './AppFiresideSidebar.vue';

const emit = defineEmits({
	back: () => true,
	streamSettings: () => true,
});

const c = useFiresideController()!;
const { fireside, rtc, isStreaming, isOwner, isDraft, canEdit, canStream } = c;

const hasMuteControls = computed(() => {
	if (!rtc.value) {
		return false;
	}

	// We only want to show mute controls for remote listable streaming users.
	const remoteUsers = rtc.value.listableStreamingUsers.filter(
		rtcUser => !rtcUser.isLocal && !!(rtcUser.remoteVideoUser || rtcUser.remoteChatUser)
	);
	return remoteUsers.length > 0;
});

const shouldShowMuteAll = computed(() => {
	if (!rtc.value) {
		return false;
	}

	return !rtc.value.isEveryRemoteListableUsersMuted;
});

function toggleMuteAll() {
	const shouldPlay = !shouldShowMuteAll.value;
	rtc.value?.listableStreamingUsers.forEach(i => setMicAudioPlayback(i, shouldPlay));
}

function onClickReport() {
	ReportModal.show(fireside);
}
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppHeaderBar :elevation="2">
				<template #leading>
					<AppButton circle sparse trans icon="chevron-left" @click="emit('back')" />
				</template>

				<template #title>
					<AppTranslate>Fireside Settings</AppTranslate>
				</template>
			</AppHeaderBar>
		</template>

		<template #body>
			<!-- TODO(fireside-redesign-3) figure out this padding -->
			<AppScrollScroller class="-pad-v">
				<div v-if="isStreaming || !isDraft" class="-pad-h">
					<AppButton v-if="canStream" block @click="emit('streamSettings')">
						<AppTranslate>Stream settings</AppTranslate>
					</AppButton>

					<AppButton
						v-if="hasMuteControls"
						:icon="shouldShowMuteAll ? 'audio-mute' : 'audio'"
						block
						@click="toggleMuteAll()"
					>
						<template v-if="shouldShowMuteAll">
							<AppTranslate>Mute All Users</AppTranslate>
						</template>
						<template v-else>
							<AppTranslate>Unmute All Users</AppTranslate>
						</template>
					</AppButton>

					<!-- Share card for audience members -->
					<AppFiresideShare v-if="!isDraft && !canStream" class="-share" />

					<hr />
				</div>

				<div class="-pad-h">
					<!-- Share card for hosts -->
					<template v-if="!isDraft && canStream">
						<AppFiresideShare class="-share" />

						<AppSpacer vertical :scale="4" />
					</template>

					<AppFiresideSettings v-if="canEdit" :c="c" />

					<AppButton v-if="!isOwner" icon="flag" trans block @click="onClickReport()">
						<AppTranslate>Report fireside</AppTranslate>
					</AppButton>
				</div>
			</AppScrollScroller>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-pad-h
	padding-left: 16px
	padding-right: 16px

.-pad-v
	padding-top: 16px
	padding-bottom: 16px
</style>
