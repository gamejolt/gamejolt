<script lang="ts">
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import { kFontSizeBase } from '../../../../_styles/variables';
import { Api } from '../../../api/api.service';
import { Screen } from '../../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../../scroll/inview/AppScrollInview.vue';
import { EmojiGroupData } from '../../../store/common-store';
import { EmojiModel } from '../../emoji.model';
import AppEmojiSelectorGroupThumbnail from './AppEmojiSelectorGroupThumbnail.vue';
import AppEmojiSelectorGroupItemLazy from './item/AppEmojiSelectorGroupItemLazy.vue';

const GroupInviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
const EmojiInviewConfig = new ScrollInviewConfig({ margin: `200px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	groupData: {
		type: Object as PropType<EmojiGroupData>,
		required: true,
	},
	gridStyles: {
		type: Object as PropType<CSSProperties>,
		required: true,
	},
});

const { groupData } = toRefs(props);

const inview = ref(false);

const emit = defineEmits({
	inview: () => true,
	outview: () => true,
	'select-emoji': (_emoji: EmojiModel) => true,
});

const itemCount = computed(() => {
	return Math.max(groupData.value.group.emojis.length, groupData.value.group.num_emojis);
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
		:config="GroupInviewConfig"
		:style="{
			marginBottom: `32px`,
		}"
		@inview="onInview()"
		@outview="onOutview()"
	>
		<div
			class="section-header"
			:style="{
				display: `flex`,
				gap: `8px`,
				alignItems: `flex-start`,
			}"
		>
			<AppEmojiSelectorGroupThumbnail
				:group="groupData.group"
				:size="kFontSizeBase.value + 2"
			/>

			<h6
				:style="{
					marginTop: 0,
				}"
			>
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
