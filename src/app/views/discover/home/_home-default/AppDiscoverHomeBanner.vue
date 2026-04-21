<script lang="ts" setup>
import { computed } from 'vue';

import AppCommunityJoinWidget from '~app/components/community/AppCommunityJoinWidget.vue';
import { FeaturedItemModel } from '~app/components/featured-item/featured-item.model';
import AppButton from '~common/button/AppButton.vue';
import AppGameFollowWidget from '~common/game/follow-widget/AppGameFollowWidget.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { useCommonStore } from '~common/store/common-store';
import AppTheme from '~common/theme/AppTheme.vue';
import { RouteLocationDefinition } from '~utils/router';

type Props = {
	item?: FeaturedItemModel;
	isLoading?: boolean;
};
const { item } = defineProps<Props>();
const { user } = useCommonStore();

const shouldShowViewGame = computed(() => {
	if (!item?.game) {
		return false;
	}

	return !item.hero_button_url || !shouldShowFollowGame.value;
});

const shouldShowFollowGame = computed(() => {
	if (item?.game) {
		return !user.value || !item.game.is_following;
	}
	return false;
});

const shouldShowViewCommunity = computed(() => {
	if (!item?.community) {
		return false;
	}

	return !item.hero_button_url || !shouldShowJoinCommunity.value;
});

const shouldShowJoinCommunity = computed(() => {
	if (item?.community) {
		return !user.value || !item.community.is_member;
	}
	return false;
});

const location = computed((): RouteLocationDefinition | undefined => {
	if (item?.game) {
		return {
			name: 'discover.games.view.overview',
			params: {
				id: item.game.id + '',
				slug: item.game.slug,
			},
		};
	} else if (item?.community) {
		return {
			name: 'communities.view.overview',
			params: {
				path: item.community.path,
			},
		};
	}
	return undefined;
});

const theme = computed(() => {
	if (item?.game) {
		return item.game.theme;
	} else if (item?.community) {
		return item.community.theme;
	}
	return undefined;
});

const bannerMediaItem = computed(() => {
	if (item?.game) {
		return item.game.header_media_item;
	}

	if (item?.community) {
		return item.community.header;
	}

	return undefined;
});
</script>

<template>
	<div v-if="!item || isLoading" class="_placeholder" />
	<AppTheme v-else :theme="theme" force-dark>
		<AppMediaItemBackdrop class="_backdrop" :media-item="bannerMediaItem">
			<section
				class="_banner landing-header-no-fill"
				:style="{
					'background-image': `url('${item.hero_back_media_item?.mediaserver_url}')`,
				}"
			>
				<router-link v-if="location" class="_click" :to="location" />
				<a v-else-if="item.hero_button_url" class="_click" :href="item.hero_button_url" />

				<div class="container">
					<div class="_main">
						<div v-if="item.hero_front_media_item" class="_logo">
							<img
								class="-img"
								:style="{
									display: `inline-block`,
								}"
								:src="item.hero_front_media_item.mediaserver_url"
								alt=""
							/>
						</div>

						<div
							class="_info"
							:class="{
								'_info-full': !item.hero_front_media_item,
							}"
						>
							<p class="_text-shadow lead">
								{{ item.hero_text }}
							</p>

							<div class="_controls">
								<template v-if="item.game">
									<AppButton
										v-if="item.hero_button_url"
										solid
										:href="item.hero_button_url"
										target="_blank"
									>
										{{ item.hero_button_text }}
									</AppButton>
									&nbsp;
									<AppButton v-if="shouldShowViewGame" solid :to="location">
										{{ $gettext(`View game`) }}
									</AppButton>

									<AppGameFollowWidget
										v-if="shouldShowFollowGame"
										:game="item.game"
										solid
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.community">
									<AppButton
										v-if="item.hero_button_url"
										solid
										:href="item.hero_button_url"
										target="_blank"
									>
										{{ item.hero_button_text }}
									</AppButton>
									&nbsp;
									<AppButton v-if="shouldShowViewCommunity" solid :to="location">
										{{ $gettext(`View community`) }}
									</AppButton>

									<AppCommunityJoinWidget
										v-if="shouldShowJoinCommunity"
										:community="item.community"
										solid
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.hero_button_url">
									<AppButton solid :href="item.hero_button_url" target="_blank">
										{{ item.hero_button_text }}
									</AppButton>
								</template>
							</div>
						</div>
					</div>
				</div>
			</section>
		</AppMediaItemBackdrop>
	</AppTheme>
</template>

<style lang="stylus" scoped>
_gutter()
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

._backdrop
._banner
._placeholder
	height: 450px

._placeholder
	change-bg('bg-subtle')

._backdrop
	change-bg('bg-offset')

._banner
	position: relative
	width: 100%
	background-repeat: no-repeat
	background-position: 50% 50%
	background-size: cover

._click
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1

.container
	height: 100%

._main
	position: relative
	display: flex
	height: 100%
	flex-direction: column
	justify-content: space-evenly
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		flex-direction: row
		align-items: center
		justify-content: center
		margin-left: -($grid-gutter-width / 2)
		margin-right: -($grid-gutter-width / 2)

._text-shadow
	overlay-text-shadow()

._logo
	_gutter()
	display: flex
	align-items: center
	justify-content: center

	.-img
		max-width: 100%

	@media $media-xs
		height: 200px

	@media $media-sm-up
		width: 60%

._info
	_gutter()
	text-align: center

	@media $media-sm-up
		width: 40%
		text-align: left

._info-full
	width: 100%
	max-width: 500px
	text-align: center

._controls
	position: relative
	// Put this over the click.
	z-index: 2
</style>
