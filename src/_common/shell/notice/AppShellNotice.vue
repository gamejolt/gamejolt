<script lang="ts" setup>
import { ref } from 'vue';

import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppShellNoticeBase from '~common/shell/notice/_base/AppShellNoticeBase.vue';
import AppShellNoticeCreatorExperience from '~common/shell/notice/creator-experience/AppShellNoticeCreatorExperience.vue';
import { getShellNotice } from '~common/shell/notice/notice.service';
import AppShellNoticeStickerMastery from '~common/shell/notice/sticker-mastery/AppShellNoticeStickerMastery.vue';
import { sleep } from '~utils/utils';

const { notices, remove: removeNotice } = getShellNotice();

const isRemoving = ref(false);

async function removeAllNotices() {
	if (isRemoving.value) {
		return;
	}
	isRemoving.value = true;

	const activeNotices = [...notices.value];

	const baseDelay = 50;
	let delay = 0;
	let count = 0;

	for (const notice of activeNotices) {
		// Animate some of the first notices being closed. All other notices
		// should close at the same time.
		if (count < 10) {
			++count;
			delay = baseDelay * count;
		}

		setTimeout(() => removeNotice(notice.id), delay);
	}

	await sleep(delay);
	isRemoving.value = false;
}
</script>

<template>
	<!-- kShellTopNavHeight is in [app] section and can't be imported here, so we use 56px. -->
	<div class="shell-notice-container top-[56px] grid justify-items-end">
		<Transition>
			<a
				v-if="notices.length > 0 && !isRemoving"
				class="_close anim-fade-enter-right anim-fade-leave-right flex items-center justify-center rounded-l-lg bg-bg-offset border-[1.5px] border-[rgba(var(--theme-fg-rgb),0.1)] border-r-0 py-[12px] px-[16px] mb-[8px]"
				@click.stop="removeAllNotices()"
			>
				<AppJolticon icon="remove" class="m-0 text-fg" />
			</a>
		</Transition>

		<TransitionGroup>
			<template v-for="item of notices" :key="item.id">
				<AppShellNoticeCreatorExperience
					v-if="item.data.type === 'creator-experience'"
					:notice-id="item.id"
					:data="item.data"
				/>
				<AppShellNoticeStickerMastery
					v-else-if="item.data.type === 'sticker-mastery'"
					:notice-id="item.id"
					:data="item.data"
				/>
				<AppShellNoticeBase
					v-else-if="item.data.type === 'custom-message'"
					:notice-id="item.id"
					:message="item.data.message"
					:auto-close-ms="item.data.autoCloseMs"
				/>
			</template>
		</TransitionGroup>
	</div>
</template>

<style lang="stylus" scoped>
._close.v-enter-active
	animation-delay: 100ms

.shell-notice-container
	position: fixed
	left: 0
	right: 0
	z-index: $zindex-growls
	margin-top: 8px

	@media $media-sm-up
		left: auto
		margin-top: 16px
</style>
