<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { ScrollInviewConfig } from '../../../../scroll/inview/AppScrollInview.vue';
import { EmojiGroupData } from '../../../../store/common-store';
import { Emoji } from '../../../emoji.model';
import AppEmojiSelectorGroupItem from './AppEmojiSelectorGroupItem.vue';

const props = defineProps({
	groupData: {
		type: Object as PropType<EmojiGroupData>,
		required: true,
	},
	isInview: {
		type: Boolean,
		required: true,
	},
	inviewConfig: {
		type: Object as PropType<ScrollInviewConfig>,
		default: undefined,
	},
	emoji: {
		type: Object as PropType<Emoji>,
		default: undefined,
	},
});

const { groupData, isInview, emoji } = toRefs(props);

const emit = defineEmits({
	select: (_emoji: Emoji) => true,
});
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
