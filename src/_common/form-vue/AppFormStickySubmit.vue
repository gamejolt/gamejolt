<script lang="ts" setup>
import { computed } from 'vue';
import AppEmoji from '../emoji/AppEmoji.vue';
import AppScrollAffix from '../scroll/AppScrollAffix.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { useForm } from './AppForm.vue';

const form = useForm();

const shouldShow = computed(() => form?.changed);
</script>

<template>
	<AppScrollAffix v-if="shouldShow" class="-form-sticky-nav" anchor="bottom" :padding="0">
		<div class="-outer">
			<div class="-content">
				<div class="-main">
					<div class="-message">
						<div class="-emoji">
							<AppEmoji emoji="yush" />
						</div>
						<AppTranslate>Don't forget to save!</AppTranslate>
					</div>
				</div>
				<div class="-trailing">
					<slot />
				</div>
			</div>
		</div>
	</AppScrollAffix>
</template>

<style lang="stylus" scoped>
.-outer
	padding-bottom: 12px

	@media $media-sm-up
		padding-bottom: 24px

.-content
	display: flex
	align-items: center

	::v-deep(.gj-scroll-affixed) &
		rounded-corners()
		background-color: var(--theme-bg-offset)
		elevate-2()

		padding: 12px

		@media $media-sm-up
			padding: 16px


.-main
	flex: auto

.-message
	display: flex
	font-size: 13px
	font-weight: bold

.-emoji
	flex: none
	margin-right: 8px

.-trailing
	flex: none
</style>
