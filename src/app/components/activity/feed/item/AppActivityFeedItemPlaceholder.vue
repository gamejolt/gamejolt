<script lang="ts" setup>
import { computed } from 'vue';
import AppButtonPlaceholder from '../../../../../_common/button/AppButtonPlaceholder.vue';
import { kThemeBgSubtle } from '../../../../../_common/theme/variables';
import {
	PostContentContainerStyles,
	PostContentLeadStyles,
	PostFeedItemContainerStyles,
	PostHeaderAvatarStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderContentStyles,
	PostHeaderMetaStyles,
	PostHeaderStyles,
	stylePostFeedItem,
} from '../../../post/post-styles';

const itemStyles = computed(() => stylePostFeedItem({ isHovered: false }));
</script>

<template>
	<div :style="PostFeedItemContainerStyles">
		<div :style="itemStyles">
			<div :style="PostHeaderStyles">
				<div :style="PostHeaderContentStyles">
					<div
						:style="[
							PostHeaderAvatarStyles,
							{ borderRadius: `100%`, backgroundColor: kThemeBgSubtle },
						]"
					/>

					<div :style="PostHeaderBylineStyles">
						<div :style="PostHeaderBylineNameStyles(false)">
							<span class="-placeholder-text" style="width: 100px" />
						</div>
					</div>
				</div>
				<div :style="PostHeaderMetaStyles">
					<span class="-placeholder-small" style="width: 75px" />
				</div>
			</div>

			<div :style="PostContentContainerStyles(false)">
				<div :style="PostContentLeadStyles">
					<span class="-placeholder-text" />
					<span class="-placeholder-text" />
					<span class="-placeholder-text" style="width: 40%" />
				</div>
			</div>

			<div>
				<AppButtonPlaceholder sparse circle />
				{{ ' ' }}
				<AppButtonPlaceholder sparse circle />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-placeholder-text
	lazy-placeholder-inline()

.-placeholder-small
	lazy-placeholder-inline()
	height: $font-size-small
</style>
