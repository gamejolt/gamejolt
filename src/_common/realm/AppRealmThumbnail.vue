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
	notRounded: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<AppResponsiveDimensions
		:class="['-thumb', { '-rounded': !notRounded }]"
		:ratio="0.75"
		:max-height="maxHeight"
	>
		<AppImgResponsive class="-img" :src="realm.cover.mediaserver_url" alt="" />
	</AppResponsiveDimensions>
</template>

<style lang="stylus" scoped>
.-thumb
	change-bg('bg-offset')
	overflow: hidden

.-rounded
	rounded-corners()

.-img
	object-fit: cover
</style>
