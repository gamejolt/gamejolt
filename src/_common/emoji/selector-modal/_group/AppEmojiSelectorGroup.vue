<script lang="ts">
import { computed, CSSProperties, ref } from 'vue';

import { Api } from '~common/api/api.service';
import { EmojiModel } from '~common/emoji/emoji.model';
import AppEmojiSelectorGroupThumbnail from '~common/emoji/selector-modal/_group/AppEmojiSelectorGroupThumbnail.vue';
import AppEmojiSelectorGroupItemLazy from '~common/emoji/selector-modal/_group/item/AppEmojiSelectorGroupItemLazy.vue';
import { Screen } from '~common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import { EmojiGroupData } from '~common/store/common-store';
import { kFontSizeBase } from '~styles/variables';

const GroupInviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
const EmojiInviewConfig = new ScrollInviewConfig({ margin: `200px` });
</script>

<script lang="ts" setup>
type Props = {
	groupData: EmojiGroupData;
	gridStyles: CSSProperties;
};
const { groupData } = defineProps<Props>();

const inview = ref(false);

const emit = defineEmits<{
	inview: [];
	outview: [];
	'select-emoji': [emoji: EmojiModel];
}>();

const itemCount = computed(() => {
	return Math.max(groupData.group.emojis.length, groupData.group.num_emojis);
});

function onInview() {
	if (inview.value) {
		return;
	}
	inview.value = true;
	emit('inview');
}

function onOutview() {
	if (!inview.value) {
		return;
	}
	inview.value = false;
	emit('outview');
}

function selectEmoji(emoji: EmojiModel) {
	Api.sendRequest(`/web/emojis/pick-emoji/${emoji.id}`, {}, { detach: true }).catch(e => {
		console.error('Failed to update recently used emoji.', e);
	});
	emit('select-emoji', emoji);
}
</script>

<template>
	<!-- AppEmojiSelectorGroup -->
	<AppScrollInview
		class="mb-[32px]"
		:config="GroupInviewConfig"
		@inview="onInview()"
		@outview="onOutview()"
	>
		<div class="section-header flex items-start gap-[8px]">
			<AppEmojiSelectorGroupThumbnail
				:group="groupData.group"
				:size="kFontSizeBase.value + 2"
			/>

			<h6 class="mt-0">
				{{ groupData.group.name }}
			</h6>
		</div>

		<div v-if="!groupData.hasError" :style="gridStyles">
			<AppEmojiSelectorGroupItemLazy
				v-for="(_, index) of itemCount"
				:key="groupData.group.emojis[index]?.id || `placeholder-${index}`"
				:group-data="groupData"
				:emoji="groupData.group.emojis[index]"
				:is-inview="inview"
				:inview-config="EmojiInviewConfig"
				@select="selectEmoji"
			/>
		</div>
		<div v-else class="well fill-offset">
			{{ $gettext(`We couldn't find anything for this group.`) }}
		</div>
	</AppScrollInview>
</template>
