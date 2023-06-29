<script lang="ts">
import { reactive, ref, Ref } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { CreatorExperience } from '../../creator/experience/experience.model';
import { $gettextInterpolate } from '../../translate/translate.service';
import AppShellNoticeBase from './_base/AppShellNoticeBase.vue';
import AppShellNoticeCreatorExperience from './creator-experience/AppShellNoticeCreatorExperience.vue';

export interface ShellNoticeItem {
	id: number;
	message: string;
	// NOTE: If adding new types, make sure they each have a unique [type]. That
	// should be enough to allow us to check [type] for different [data] types.
	data: CreatorExperienceNotice;
}

export interface CreatorExperienceNotice {
	type: 'creator-experience';
	experience: CreatorExperience;
	leveledUp: boolean;
	xpGained: number;
}

export const ShellNotice = reactive({
	incrementer: 0,
	notices: ref([]) as Ref<ShellNoticeItem[]>,
	remove(id: number) {
		arrayRemove(ShellNotice.notices, i => i.id === id);
	},
	addCreatorExperience({
		experience,
		leveledUp,
		xpGained,
	}: {
		experience: CreatorExperience;
		leveledUp: boolean;
		xpGained: number;
	}) {
		const id = ++this.incrementer;

		const message = leveledUp
			? $gettextInterpolate(`Level up! You are now level %{ level }.`, {
					level: experience.current_level,
			  })
			: $gettextInterpolate(`You gained %{ xpGained } experience.`, { xpGained });

		ShellNotice.notices.push({
			id,
			message,
			data: {
				type: 'creator-experience',
				experience,
				leveledUp,
				xpGained,
			},
		});
	},
});
</script>

<script lang="ts" setup>
defineProps({});
</script>

<template>
	<div
		class="shell-notice-container"
		:style="{
			// kShellTopNavHeight can't be imported here, since it's in [app] section.
			top: `56px`,
			display: `grid`,
			justifyItems: `end`,
		}"
	>
		<TransitionGroup>
			<template v-for="item of ShellNotice.notices" :key="item.id">
				<AppShellNoticeCreatorExperience
					v-if="item.data.type === 'creator-experience'"
					class="_notice"
					:notice-id="item.id"
					:data="item.data"
					:message="item.message"
				/>
				<AppShellNoticeBase
					v-else
					class="_notice"
					:notice-id="item.id"
					:message="item.message"
					:auto-close-ms="5_000"
				/>
			</template>
		</TransitionGroup>
	</div>
</template>

<style lang="stylus" scoped>
.shell-notice-container
	position: fixed
	left: 0
	right: 0
	z-index: $zindex-growls
	margin-top: 8px

	@media $media-sm-up
		left: auto
		margin-top: 16px

._notice
	margin-bottom: 4px
</style>
