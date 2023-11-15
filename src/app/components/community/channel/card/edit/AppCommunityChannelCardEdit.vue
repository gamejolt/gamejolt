<script lang="ts" setup>
import { PropType } from 'vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { MediaItemModel } from '../../../../../../_common/media-item/media-item-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg } from '../../../../../../_styles/mixins';
import {
	CommunityChannelCardHeight,
	CommunityChannelCardWidth,
} from '../AppCommunityChannelCard.vue';

defineProps({
	background: {
		type: Object as PropType<MediaItemModel | null>,
		default: null,
	},
});

const emit = defineEmits({
	click: () => true,
});

function onClickEdit() {
	emit('click');
}
</script>

<template>
	<AppEditableOverlay
		:style="{
			...styleBorderRadiusLg,
			width: `${CommunityChannelCardWidth}px`,
			height: `${CommunityChannelCardHeight}px`,
			overflow: `hidden`,
		}"
		@click="onClickEdit"
	>
		<template #overlay>
			<span>
				{{ $gettext(`Change Background`) }}
			</span>
		</template>

		<template #default>
			<div
				:style="{
					...styleBorderRadiusLg,
					display: `flex`,
					alignItems: `center`,
					width: `${CommunityChannelCardWidth}px`,
					height: `${CommunityChannelCardHeight}px`,
					overflow: `hidden`,
				}"
			>
				<img
					v-if="background"
					:style="{ width: `100%` }"
					:src="background.mediaserver_url"
					:alt="background.mediaserver_url"
				/>
			</div>
		</template>
	</AppEditableOverlay>
</template>
