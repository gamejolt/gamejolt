<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppCommunityJoinWidget from '../../../../../_common/community/join-widget/join-widget.vue';
import AppGameFollowWidget from '../../../../../_common/game/follow-widget/follow-widget.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTheme from '../../../../../_common/theme/AppTheme.vue';
import { RouteLocationDefinition } from '../../../../../utils/router';
import { FeaturedItemModel } from '../../../../components/featured-item/featured-item.model';

const props = defineProps({
	item: {
		type: Object as PropType<FeaturedItemModel>,
		default: undefined,
	},
	isLoading: {
		type: Boolean,
	},
});

const { item, isLoading } = toRefs(props);
const { user } = useCommonStore();

const shouldShowViewGame = computed(() => {
	if (!item?.value?.game) {
		return false;
	}

	return !item?.value.hero_button_url || !shouldShowFollowGame.value;
});

const shouldShowFollowGame = computed(() => {
	if (item?.value?.game) {
		return !user.value || !item?.value.game.is_following;
	}
	return false;
});

const shouldShowViewCommunity = computed(() => {
	if (!item?.value?.community) {
		return false;
	}

	return !item?.value.hero_button_url || !shouldShowJoinCommunity.value;
});

const shouldShowJoinCommunity = computed(() => {
	if (item?.value?.community) {
		return !user.value || !item?.value.community.is_member;
	}
	return false;
});

const location = computed((): RouteLocationDefinition | undefined => {
	if (item?.value?.game) {
		return {
			name: 'discover.games.view.overview',
			params: {
				id: item?.value.game.id + '',
				slug: item?.value.game.slug,
			},
		};
	} else if (item?.value?.community) {
		return {
			name: 'communities.view.overview',
			params: {
				path: item?.value.community.path,
			},
		};
	}
	return undefined;
});

const theme = computed(() => {
	if (item?.value?.game) {
		return item?.value.game.theme;
	} else if (item?.value?.community) {
		return item?.value.community.theme;
	}
	return undefined;
});

const bannerMediaItem = computed(() => {
	if (item?.value?.game) {
		return item?.value.game.header_media_item;
	}

	if (item?.value?.community) {
		return item?.value.community.header;
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
										primary
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
										primary
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
