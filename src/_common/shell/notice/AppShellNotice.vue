<script lang="ts" setup>
import AppShellNoticeBase from './_base/AppShellNoticeBase.vue';
import AppShellNoticeCreatorExperience from './creator-experience/AppShellNoticeCreatorExperience.vue';
import { getShellNotice } from './notice.service';

const { notices } = getShellNotice();
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
		<TransitionGroup>
			<template v-for="item of notices" :key="item.id">
				<AppShellNoticeCreatorExperience
					v-if="item.data.type === 'creator-experience'"
					class="_notice"
					:notice-id="item.id"
					:data="item.data"
				/>
				<AppShellNoticeBase
					v-else-if="item.data.type === 'custom-message'"
					class="_notice"
					:notice-id="item.id"
					:message="item.data.message"
					:auto-close-ms="item.data.autoCloseMs"
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
