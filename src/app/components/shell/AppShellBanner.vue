<script lang="ts" setup>
import { onUnmounted, unref, watch } from 'vue';
import { Scroll } from '../../../_common/scroll/scroll.service';
import { useBannerStore } from '../../store/banner';

const { hasBanner, currentBanner, clickBanner, closeBanner } = useBannerStore();

watch(
	() => unref(hasBanner),
	isShowing => {
		if (isShowing) {
			Scroll.setOffsetTop(56 * 2);
		} else {
			Scroll.setOffsetTop(56);
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	Scroll.setOffsetTop(56);
});
</script>

<template>
	<div
		v-if="currentBanner"
		id="shell-banner"
		class="-banner"
		:class="{
			'-clickable': currentBanner.canClick,
			'fill-highlight': currentBanner.type === 'info',
			'fill-notice': currentBanner.type === 'error',
		}"
		@click="clickBanner()"
	>
		<a class="-close" @click.stop="closeBanner()">
			<AppJolticon icon="remove" />
		</a>

		<div class="-message" v-html="currentBanner.message" />
	</div>
</template>

<style lang="stylus" scoped>
.-banner
	position: fixed
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)
	height: $shell-top-nav-height
	line-height: $shell-top-nav-height
	z-index: $zindex-shell-top-nav
	font-size: $font-size-small

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)
		text-align: center
		font-size: $font-size-base
		font-weight: bold

	::v-deep(em)
		font-style: normal
		text-decoration: underline

.-clickable
	cursor: pointer

.-message
	text-overflow()

.-close
	float: right
	margin-left: 10px

	@media $media-sm-up
		margin-left: 0
</style>
