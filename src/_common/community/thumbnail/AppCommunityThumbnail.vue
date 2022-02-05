<script lang="ts" setup>
import { PropType } from 'vue';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from './AppCommunityThumbnailImg.vue';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});

function onGotoCommunity() {
	trackGotoCommunity({
		source: 'thumbnail',
		id: props.community.id,
		path: props.community.path,
	});
}
</script>

<template>
	<router-link
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
		@click="onGotoCommunity"
	>
		<div class="-thumb">
			<AppCommunityThumbnailImg class="-thumb-inner" :community="community" />
		</div>

		<div class="-label">
			{{ community.name }}
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
.-thumb
	position: relative
	height: 0
	padding-top: 100%

	&-inner
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%

.-label
	text-overflow()
	theme-prop('color', 'fg')
	font-weight: bold
	text-align: center
	margin-top: 8px

	.-item:hover &
		theme-prop('color', 'link')
</style>
