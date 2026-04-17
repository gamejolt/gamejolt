<script lang="ts" setup>
import { EmojiModel } from '~common/emoji/emoji.model';
import AppEmojiSelectorGroupItem from '~common/emoji/selector-modal/_group/item/AppEmojiSelectorGroupItem.vue';
import { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import { EmojiGroupData } from '~common/store/common-store';

type Props = {
	groupData: EmojiGroupData;
	isInview: boolean;
	inviewConfig?: ScrollInviewConfig;
	emoji?: EmojiModel;
};
const { groupData, isInview, inviewConfig, emoji } = defineProps<Props>();

const emit = defineEmits<{
	select: [emoji: EmojiModel];
}>();
</script>

<!--
	Build some 1:1 placeholder when this group
	is outside of view. Should help lessen the
	load of building everything out.

	NOTE: AppAspectRatio is slower than this,
	don't use it here.
-->
<template>
	<!-- AppEmojiSelectorGroupItemLazy -->
	<div
		v-if="!emoji || !isInview || !groupData.isBootstrapped"
		:style="{
			width: `100%`,
			paddingTop: `100%`,
			height: 0,
		}"
	/>
	<AppEmojiSelectorGroupItem
		v-else
		:emoji="emoji"
		:inview-config="inviewConfig"
		@select="emit('select', $event)"
	/>
</template>
