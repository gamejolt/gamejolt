<script lang="ts" setup>
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import { RealmModel } from './realm-model';

type Props = {
	realm: RealmModel;
	maxHeight?: number;
	notRounded?: boolean;
};
defineProps<Props>();
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
