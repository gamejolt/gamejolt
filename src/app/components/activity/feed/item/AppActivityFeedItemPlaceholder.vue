<script lang="ts" setup>
import { computed } from 'vue';

import AppButtonPlaceholder from '~common/button/AppButtonPlaceholder.vue';
import {
	getPostContentLeadStyles,
	getPostFeedItemContainerStyles,
	getPostHeaderAvatarStyles,
	getPostHeaderMetaStyles,
	PostContentContainerStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderContentStyles,
	PostHeaderStyles,
	stylePostFeedItem,
} from '~common/post/post-styles';
import { kThemeBgSubtle } from '~common/theme/variables';

const itemStyles = computed(() => stylePostFeedItem({ isHovered: false }));
</script>

<template>
	<div :style="getPostFeedItemContainerStyles()">
		<div :style="itemStyles">
			<div :style="PostHeaderStyles">
				<div :style="PostHeaderContentStyles">
					<div
						:style="[
							getPostHeaderAvatarStyles(),
							{ borderRadius: `100%`, backgroundColor: kThemeBgSubtle },
						]"
					/>

					<div :style="PostHeaderBylineStyles">
						<div :style="PostHeaderBylineNameStyles(false)">
							<span class="-placeholder-text" style="width: 100px" />
						</div>
					</div>
				</div>
				<div :style="getPostHeaderMetaStyles()">
					<span class="-placeholder-small" style="width: 75px" />
				</div>
			</div>

			<div :style="PostContentContainerStyles(false)">
				<div :style="getPostContentLeadStyles()">
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
