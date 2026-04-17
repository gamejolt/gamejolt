<script lang="ts" setup>
import {
	CommunityChannelCardHeight,
	CommunityChannelCardWidth,
} from '~app/components/community/channel/card/AppCommunityChannelCard.vue';
import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { $gettext } from '~common/translate/translate.service';

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
		class="rounded-lg"
		:style="{
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
				class="rounded-lg"
				:style="{
					display: `flex`,
					alignItems: `center`,
					width: `${CommunityChannelCardWidth}px`,
					height: `${CommunityChannelCardHeight}px`,
					overflow: `hidden`,
				}"
			>
				<img
					v-if="background"
					class="w-full"
					:src="background.mediaserver_url"
					:alt="background.mediaserver_url"
				/>
			</div>
		</template>
	</AppEditableOverlay>
</template>
