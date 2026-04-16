<script lang="ts" setup>
import {
	CommunityChannelCardHeight,
	CommunityChannelCardWidth,
} from '~app/components/community/channel/card/AppCommunityChannelCard.vue';
import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { $gettext } from '~common/translate/translate.service';
import { styleBorderRadiusLg } from '~styles/mixins';

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
