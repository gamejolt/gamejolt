<script lang="ts" setup>
import { computed } from 'vue';

import AppEmoji from '~common/emoji/AppEmoji.vue';
import { useForm } from '~common/form-vue/AppForm.vue';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import { $gettext } from '~common/translate/translate.service';

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
						{{ $gettext(`Don't forget to save!`) }}
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

	:deep(.gj-scroll-affixed) &
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
