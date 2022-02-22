<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppRealmLabel from './AppRealmLabel.vue';
import AppRealmFollowButton from './AppRealmFollowButton.vue';
import AppResponsiveDimensions from '../responsive-dimensions/AppResponsiveDimensions.vue';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';

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

		<AppResponsiveDimensions :ratio="3 / 4">
			<AppMediaItemBackdrop :media-item="realm.cover">
				<AppImgResponsive class="-cover-img" :src="realm.cover.mediaserver_url" alt="" />
			</AppMediaItemBackdrop>
		</AppResponsiveDimensions>

		<div class="-content">
			<AppRealmFollowButton :realm="realm" source="fullCard" block />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-card
	position: relative
	overflow: hidden

.-cover-img
	width: 100%
	height: 100%
	object-fit: cover

.-content
	padding: 16px

.-label
	position: absolute
	left: 8px
	top: 8px
	z-index: 1
</style>
