<script lang="ts" setup>
import { PropType } from 'vue';
import { Screen } from '../screen/screen-service';
import { User } from '../user/user.model';
import AppStickerReactions from './reactions/AppStickerReactions.vue';
import { StickerCount } from './sticker-count';
import AppStickerSupporters from './supporters/AppStickerSupporters.vue';
import { StickerTargetController } from './target/target-controller';

defineProps({
	stickerTargetController: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	supporters: {
		type: Array as PropType<User[]>,
		required: true,
	},
	stickers: {
		type: Array as PropType<StickerCount[]>,
		required: true,
	},
});

const emit = defineEmits({
	show: () => true,
});
</script>

<template>
	<div v-if="supporters.length || stickers.length" class="sticker-placement-list">
		<AppStickerSupporters
			v-if="supporters.length"
			class="-supporters"
			:limit="Screen.isDesktop ? 8 : Math.max(1, Math.min(8, Math.round(Screen.width / 100)))"
			:supporters="supporters"
			:style="{
				marginRight: stickers.length ? '12px' : undefined,
			}"
		/>

		<AppStickerReactions
			v-if="stickers.length"
			class="-reactions"
			:controller="stickerTargetController"
			@show="emit('show')"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-placement-list
	display: inline-flex
	align-items: center
	margin-bottom: 16px

.-supporters
	align-self: flex-start

.-reactions
	margin: 0
	line-height: 1
</style>
