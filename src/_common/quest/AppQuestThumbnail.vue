<script lang="ts" setup>
import { PropType } from 'vue';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppQuestFrame from './AppQuestFrame.vue';
import { Quest } from './quest-model';

defineProps({
	quest: {
		type: Object as PropType<Quest>,
		required: true,
	},
});
</script>

<template>
	<AppQuestFrame>
		<AppImgResponsive class="-img" :src="quest.avatar.mediaserver_url" alt="Quest Image" />
	</AppQuestFrame>
</template>

<style lang="stylus" scoped>
.-img
	width: 100%
	height: 100%
	object-fit: cover
</style>
