<script lang="ts" setup>
import AppProgressBar from '../../../_common/progress/AppProgressBar.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../components/fireside/controller/controller';

const c = useFiresideController()!;
const { isDraft, isStreaming, expiresProgressValue, expiresDurationText } = c;
</script>

<template>
	<div
		v-if="!isDraft && !isStreaming && expiresProgressValue !== undefined"
		class="fireside-stats"
	>
		<div class="-burnout-bar">
			<AppProgressBar class="-burnout-bar-inner" :percent="expiresProgressValue" thin />
		</div>

		<div v-if="expiresDurationText" class="text-center">
			<span><AppTranslate>This fireside burns out in</AppTranslate></span>
			{{ ' ' }}
			<span class="-expiry">
				<b>{{ expiresDurationText }}</b>
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-stats
	display: flex
	flex-direction: column
	justify-content: space-between
	width: 100%

.-burnout-bar
	padding: 0 24px
	margin-bottom: 8px

.-burnout-bar-inner
	margin-bottom: 0

.-expiry
	color: var(--theme-primary)
</style>
