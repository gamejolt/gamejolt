<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';

type Props = {
	item: MediaItemModel;
};

const { item } = defineProps<Props>();

const emit = defineEmits<{
	remove: [];
}>();

const dimensions = item.getDimensions(300, 130);
const width = dimensions.width + 'px';
const height = dimensions.height + 'px';
</script>

<template>
	<div class="-item" :style="{ width, height }">
		<div class="-controls theme-dark">
			<AppButton icon="remove" overlay sparse @click.capture="emit('remove')" />
		</div>

		<AppImgResponsive :src="item.mediaserver_url" alt="" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-item
	rounded-corners-lg()
	change-bg('bg-subtle')
	position: relative
	display: inline-block
	vertical-align: top
	cursor: move
	// Spacing through margins.
	margin-right: $-padding

	&:last-child
		margin-right: 0

	img
		rounded-corners-lg()
		z-index: 1

.-controls
	position: absolute
	top: 3px
	right: 3px
	z-index: 2
</style>
