<script lang="ts" setup>
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { MediaItemModel } from '../../../../../../_common/media-item/media-item-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg } from '../../../../../../_styles/mixins';
import {
	CommunityChannelCardHeight,
	CommunityChannelCardWidth,
} from '../AppCommunityChannelCard.vue';

type Props = {
	background?: MediaItemModel | null;
};
const { background = null } = defineProps<Props>();

const emit = defineEmits<{
	click: [];
}>();

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
		@toggle="onClickEdit"
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
