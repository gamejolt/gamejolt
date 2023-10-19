<script lang="ts" setup>
import { PropType } from 'vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { MediaItemModel } from '../../../../../../_common/media-item/media-item-model';
import { $gettext } from '../../../../../../_common/translate/translate.service';

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
	<AppEditableOverlay class="-background-overlay" @click="onClickEdit">
		<template #overlay>
			<span>
				{{ $gettext(`Change Background`) }}
			</span>
		</template>

		<template #default>
			<div class="-background-preview">
				<img
					v-if="background"
					:src="background.mediaserver_url"
					:alt="background.mediaserver_url"
				/>
			</div>
		</template>
	</AppEditableOverlay>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-background-overlay
	rounded-corners-lg()
	overflow: hidden
	width: $card-width
	height: $card-height

.-background-preview
	rounded-corners-lg()
	display: flex
	align-items: center
	width: $card-width
	height: $card-height
	overflow: hidden

	img
		width: 100%
</style>
