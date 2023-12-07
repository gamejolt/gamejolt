<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import { CommunityModel } from '../community.model';
import AppCommunityThumbnailImg from './AppCommunityThumbnailImg.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
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
	<RouterLink
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
		@click="onGotoCommunity"
	>
		<AppCommunityThumbnailImg :community="community" />

		<div class="-label">
			{{ community.name }}
		</div>
	</RouterLink>
</template>

<style lang="stylus" scoped>
.-label
	text-overflow()
	theme-prop('color', 'fg')
	font-weight: bold
	text-align: center
	margin-top: 8px

	.-item:hover &
		theme-prop('color', 'link')
</style>
