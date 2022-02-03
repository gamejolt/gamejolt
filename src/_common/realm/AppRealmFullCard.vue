<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppRealmLabel from './AppRealmLabel.vue';
import AppRealmFollowButton from './AppRealmFollowButton.vue';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<div class="-card sheet sheet-full sheet-elevate">
		<AppRealmLabel class="-label" :realm="realm" />

		<div class="-header">
			<AppImgResponsive class="-header-img" :src="realm.header.mediaserver_url" alt="" />
		</div>

		<div class="-content">
			<AppRealmFollowButton :realm="realm" block primary />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-card
	position: relative
	overflow: hidden

.-header
	aspect-ratio: 300 / 175

	&-img
		width: 100%
		height: 100%
		object-fit: cover

.-content
	padding: 16px 10px 14px

.-label
	position: absolute
	left: 8px
	top: 8px
</style>
