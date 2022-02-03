<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppImgResponsive from '../img/AppImgResponsive.vue';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<div class="-thumb">
		<AppImgResponsive class="-img" :src="realm.cover.mediaserver_url" alt="" />
	</div>
</template>

<style lang="stylus" scoped>
.-thumb
	img-circle()
	change-bg('bg-offset')
	position: relative
	height: 0
	padding-top: 100%
	overflow: hidden

.-img
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	object-fit: cover
</style>
