<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationDefinition } from '../../../../../utils/router';
import AppCommunityJoinWidget from '../../../../../_common/community/join-widget/join-widget.vue';
import AppGameFollowWidget from '../../../../../_common/game/follow-widget/follow-widget.vue';
import { Jam } from '../../../../../_common/jam/jam.model';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTheme from '../../../../../_common/theme/AppTheme.vue';
import { FeaturedItem } from '../../../../components/featured-item/featured-item.model';

@Options({
	components: {
		AppGameFollowWidget,
		AppCommunityJoinWidget,
		AppTheme,
		AppMediaItemBackdrop,
	},
})
export default class AppDiscoverHomeBanner extends Vue {
	@Prop(Object) item?: FeaturedItem;
	@Prop({ type: Boolean, default: false }) isLoading!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly Screen = Screen;

	get shouldShowViewGame() {
		if (!this.item?.game) {
			return false;
		}

		return !this.item.custom_url || !this.shouldShowFollowGame;
	}

	get shouldShowFollowGame() {
		if (this.item?.game) {
			return !this.app.user || !this.item.game.is_following;
		}
		return false;
	}

	get shouldShowViewCommunity() {
		if (!this.item?.community) {
			return false;
		}

		return !this.item.custom_url || !this.shouldShowJoinCommunity;
	}

	get shouldShowJoinCommunity() {
		if (this.item?.community) {
			return !this.app.user || !this.item.community.is_member;
		}
		return false;
	}

	get shouldShowJamViewGames() {
		if (!this.item?.jam) {
			return false;
		}

		return this.item.jam.getPeriod() >= Jam.PERIOD_RUNNING;
	}

	get location(): RouteLocationDefinition | null {
		if (this.item?.game) {
			return {
				name: 'discover.games.view.overview',
				params: {
					id: this.item.game.id + '',
					slug: this.item.game.slug,
				},
			};
		} else if (this.item?.jam) {
			return {
				name: 'library.collection.jam',
				params: {
					id: this.item.jam.url,
				},
			};
		} else if (this.item?.community) {
			return {
				name: 'communities.view.overview',
				params: {
					path: this.item.community.path,
				},
			};
		}
		return null;
	}

	get theme() {
		if (this.item?.game) {
			return this.item.game.theme;
		} else if (this.item?.community) {
			return this.item.community.theme;
		}
		return null;
	}

	get bannerMediaItem() {
		if (this.item?.game) {
			return this.item.game.header_media_item;
		}

		if (this.item?.community) {
			return this.item.community.header;
		}

		return null;
	}
}
</script>

<template>
	<div v-if="!item || isLoading" class="-placeholder" />
	<AppTheme v-else :theme="theme" force-dark>
		<AppMediaItemBackdrop class="-backdrop" :media-item="bannerMediaItem">
			<section
				class="-banner landing-header-no-fill"
				:style="{
					'background-image': `url('${item.back_url}')`,
				}"
			>
				<router-link
					v-if="location"
					v-app-track-event="`home:banner:${item.id}`"
					class="-click"
					:to="location"
				/>
				<a
					v-else-if="item.custom_url"
					v-app-track-event="`home:banner:${item.id}`"
					class="-click"
					:href="item.custom_url"
				/>

				<div class="container">
					<div class="-main">
						<div v-if="item.front_url" class="-logo">
							<img
								class="-img"
								style="display: inline-block"
								:src="item.front_url"
								alt=""
							/>
						</div>

						<div
							class="-info"
							:class="{
								'-info-full': !item.front_url,
							}"
						>
							<p class="-text-shadow lead">
								{{ item.content }}
							</p>

							<div class="-controls">
								<template v-if="item.game">
									<AppButton
										v-if="item.custom_url"
										v-app-track-event="`home:banner:custom-${item.game.id}`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</AppButton>

									<AppButton
										v-if="shouldShowViewGame"
										v-app-track-event="`home:banner:${item.game.id}`"
										solid
										:to="location"
									>
										<AppTranslate>View Game</AppTranslate>
									</AppButton>

									<AppGameFollowWidget
										v-if="shouldShowFollowGame"
										v-app-track-event="`home:banner:follow-${item.game.id}`"
										:game="item.game"
										solid
										primary
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.community">
									<AppButton
										v-if="item.custom_url"
										v-app-track-event="
											`home:banner:custom-community-${item.community.path}`
										"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</AppButton>

									<AppButton
										v-if="shouldShowViewCommunity"
										v-app-track-event="
											`home:banner:community-${item.community.path}`
										"
										solid
										:to="location"
									>
										<AppTranslate>View Community</AppTranslate>
									</AppButton>

									<AppCommunityJoinWidget
										v-if="shouldShowJoinCommunity"
										:community="item.community"
										solid
										primary
										location="homeBanner"
									/>
								</template>
								<template v-else-if="item.jam">
									<AppButton
										v-if="shouldShowJamViewGames"
										v-app-track-event="`home:banner:${item.jam.id}`"
										primary
										solid
										:to="location"
									>
										<AppTranslate>View Games</AppTranslate>
									</AppButton>
									<AppButton
										v-app-track-event="`home:banne:jam-${item.jam.id}`"
										solid
										:href="item.jam.fullUrl"
										target="_blank"
									>
										<AppTranslate>View Jam Page</AppTranslate>
									</AppButton>
								</template>
								<template v-else-if="item.custom_url">
									<AppButton
										v-app-track-event="`home:banner:custom`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
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
-gutter()
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

.-backdrop
.-banner
.-placeholder
	height: 450px

.-placeholder
	change-bg('bg-subtle')

.-backdrop
	change-bg('bg-offset')

.-banner
	position: relative
	width: 100%
	background-repeat: no-repeat
	background-position: 50% 50%
	background-size: cover

.-click
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1

.container
	height: 100%

.-main
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

.-text-shadow
	overlay-text-shadow()

.-logo
	-gutter()
	display: flex
	align-items: center
	justify-content: center

	.-img
		max-width: 100%

	@media $media-xs
		height: 200px

	@media $media-sm-up
		width: 60%

.-info
	-gutter()
	text-align: center

	@media $media-sm-up
		width: 40%
		text-align: left

	&-full
		width: 100%
		max-width: 500px
		text-align: center

.-controls
	position: relative
	// Put this over the click.
	z-index: 2
</style>
