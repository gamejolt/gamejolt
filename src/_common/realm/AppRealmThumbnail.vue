<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<AppResponsiveDimensions class="-thumb" :ratio="1">
		<AppImgResponsive class="-img" :src="realm.cover.mediaserver_url" alt="" />
	</AppResponsiveDimensions>
</template>

<style lang="stylus" scoped>
.-thumb
	img-circle()
	change-bg('bg-offset')
	overflow: hidden

.-img
	object-fit: cover
</style>
