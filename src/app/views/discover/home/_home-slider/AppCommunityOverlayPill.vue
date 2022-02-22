<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';

defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});
</script>

<template>
	<div class="-pill">
		<span class="-img">
			<AppCommunityThumbnailImg :community="community" />
		</span>
		<span class="-content">
			{{ community.name }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-pill
	rounded-corners()
	background-color: rgba($black, 0.5)
	color: $white
	display: inline-flex
	align-items: center
	padding: 4px
	font-size: 11px
	user-select: none
	margin-right: 5px
	margin-bottom: 5px

	@media $media-xs
		font-size: 9px

.-img
	img-circle()
	overflow: hidden
	margin-right: 4px
	width: 16px
	height: 16px
</style>
