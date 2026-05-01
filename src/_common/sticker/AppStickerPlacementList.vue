<script lang="ts" setup>
import { computed } from 'vue';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import { getScreen } from '~common/screen/screen-service';
import AppStickerSupporters from '~common/sticker/AppStickerSupporters.vue';
import AppStickerReactions from '~common/sticker/reactions/AppStickerReactions.vue';
import { StickerCount } from '~common/sticker/sticker-count';
import { StickerTargetController } from '~common/sticker/target/target-controller';
import { UserModel } from '~common/user/user.model';

type Props = {
	stickerTargetController: StickerTargetController;
	supporters: UserModel[];
	stickers: StickerCount[];
};
const { stickerTargetController } = defineProps<Props>();

const emit = defineEmits<{
	show: [];
}>();

const { isDesktop, screenWidth } = getScreen();

// We only allow this type of model to show the supporters currently.
const supportersModel = computed(() =>
	stickerTargetController.model instanceof FiresidePostModel
		? stickerTargetController.model
		: undefined
);
</script>

<template>
	<div v-if="supporters.length || stickers.length" class="sticker-placement-list">
		<AppStickerSupporters
			v-if="supporters.length && supportersModel"
			class="-supporters"
			:model="supportersModel"
			:limit="isDesktop ? 8 : Math.max(1, Math.min(8, Math.round(screenWidth / 100)))"
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
