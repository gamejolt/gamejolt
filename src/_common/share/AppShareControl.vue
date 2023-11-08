<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../button/AppButton.vue';
import { copyShareLink, ShareResource } from './share.service';

const props = defineProps({
	resource: {
		type: String as PropType<ShareResource>,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
});

function copyLink() {
	copyShareLink(props.url, props.resource);
}
</script>

<template>
	<div class="share-control">
		<!-- force update on input so that the URL re-applies and they can't edit -->
		<input class="-url form-control" :value="url" @input="$forceUpdate()" />

		<AppButton :style="{ flex: `none` }" @click="copyLink()">
			{{ $gettext(`Copy`) }}
		</AppButton>
	</div>
</template>

<style lang="stylus" scoped>
.share-control
	display: flex
	grid-gap: 8px

.-url
	flex: auto
	height: $button-md-line-height
</style>
