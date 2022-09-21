<script lang="ts" setup>
import { PropType } from 'vue';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import { Realm } from './realm-model';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	maxHeight: {
		type: Number,
		default: undefined,
	},
});
</script>

<template>
	<AppResponsiveDimensions class="-thumb" :ratio="0.75" :max-height="maxHeight">
		<AppImgResponsive class="-img" :src="realm.cover.mediaserver_url" alt="" />
	</AppResponsiveDimensions>
</template>

<style lang="stylus" scoped>
.-thumb
	rounded-corners()
	change-bg('bg-offset')
	overflow: hidden

.-img
	object-fit: cover
</style>
