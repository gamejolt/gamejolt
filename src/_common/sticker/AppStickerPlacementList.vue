<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { FiresidePost } from '../fireside/post/post-model';
import { Screen } from '../screen/screen-service';
import { User } from '../user/user.model';
import AppStickerSupporters from './AppStickerSupporters.vue';
import AppStickerReactions from './reactions/AppStickerReactions.vue';
import { StickerCount } from './sticker-count';
import { StickerTargetController } from './target/target-controller';

const props = defineProps({
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

const { stickerTargetController } = toRefs(props);

// We only allow this type of model to show the supporters currently.
const supportersModel = computed(() =>
	stickerTargetController.value.model instanceof FiresidePost
		? stickerTargetController.value.model
		: undefined
);
</script>

<template>
	<div v-if="supporters.length || stickers.length" class="sticker-placement-list">
		<AppStickerSupporters
			v-if="supporters.length && supportersModel"
			class="-supporters"
			:model="supportersModel"
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
	flex-direction: column
	align-items: flex-start
	gap: 8px
	margin-bottom: 16px

.-supporters
	align-self: flex-start

.-reactions
	margin: 0 !important
	line-height: 1
</style>
