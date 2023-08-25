<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { CommunityModel } from '../../../../_common/community/community.model';
import { formatNumber } from '../../../../_common/filters/number';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { $ngettext } from '../../../../_common/translate/translate.service';

defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
});
</script>

<template>
	<AppTheme :theme="community.theme">
		<RouterLink
			:to="{
				name: 'communities.view.overview',
				params: { path: community.path },
			}"
		>
			<div class="-community-container fill-darkest">
				<AppMediaItemBackdrop
					v-if="community.header"
					class="-backdrop"
					:media-item="community.header"
					radius="lg"
				>
					<div
						class="-header"
						:style="{
							'background-image': 'url(' + community.header.mediaserver_url + ')',
						}"
					>
						<div class="-header-gradient" />
					</div>
				</AppMediaItemBackdrop>

				<div class="-content">
					<div class="-thumbnail">
						<img :src="community.img_thumbnail" />
					</div>
					<div>
						<div class="tag">
							{{ $gettext(`Game Community`) }}
						</div>
						<div class="-name">
							{{ community.name }}
						</div>
						<div v-if="community.member_count > 0" class="-member-count">
							{{
								$ngettext(
									`%{ count } Member`,
									`%{ count } Members`,
									community.member_count || 0,
									{ count: formatNumber(community.member_count || 0) }
								)
							}}
						</div>
					</div>
				</div>
			</div>
		</RouterLink>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static

.-community-container
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	padding: 10px 15px
	elevate-hover-2()

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 0
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	transition: background-size 250ms, filter 250ms

	&-gradient
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

.-content
	position: relative
	z-index: 1
	display: flex
	align-items: center

.tag
	// This makes all the text align at the left.
	margin-left: -4px

.-name
	font-weight: bolder
	font-size: $font-size-h4

.-thumbnail
	width: 50px
	height: 50px
	background-color: var(--theme-white)
	border-radius: 50%
	padding: 2px
	margin-right: ($grid-gutter-width / 4)
	flex-shrink: 0

	img
		display: block
		width: 100%
		height: 100%
		img-circle()

.-member-count
	font-size: $font-size-small
</style>
