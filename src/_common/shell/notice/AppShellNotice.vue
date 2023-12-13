<script lang="ts" setup>
import { ref } from 'vue';
import { styleFlexCenter } from '../../../_styles/mixins';
import { kBorderRadiusLg, kBorderWidthBase } from '../../../_styles/variables';
import { sleep } from '../../../utils/utils';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { kThemeBgOffset, kThemeFg, kThemeFg10 } from '../../theme/variables';
import AppShellNoticeBase from './_base/AppShellNoticeBase.vue';
import AppShellNoticeCreatorExperience from './creator-experience/AppShellNoticeCreatorExperience.vue';
import { getShellNotice } from './notice.service';
import AppShellNoticeStickerMastery from './sticker-mastery/AppShellNoticeStickerMastery.vue';

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
	<div
		class="shell-notice-container"
		:style="{
			// kShellTopNavHeight is in [app] section and can't be imported here.
			top: `56px`,
			display: `grid`,
			justifyItems: `end`,
		}"
	>
		<Transition>
			<a
				v-if="notices.length > 0 && !isRemoving"
				class="_close anim-fade-enter-right anim-fade-leave-right"
				:style="{
					borderTopLeftRadius: kBorderRadiusLg.px,
					borderBottomLeftRadius: kBorderRadiusLg.px,
					backgroundColor: kThemeBgOffset,
					border: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
					borderRight: `none`,
					padding: `12px 16px`,
					marginBottom: `8px`,
					...styleFlexCenter(),
				}"
				@click.stop="removeAllNotices()"
			>
				<AppJolticon icon="remove" :style="{ margin: 0, color: kThemeFg }" />
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
