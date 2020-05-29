<template>
	<div v-if="!item || isLoading" class="-placeholder"></div>
	<app-theme v-else :theme="theme">
		<app-media-item-backdrop class="-backdrop" :media-item="bannerMediaItem">
			<section
				class="-banner section landing-header"
				:style="{
					'background-image': `url('${item.back_url}')`,
				}"
			>
				<router-link
					v-if="location"
					class="-click"
					:to="location"
					v-app-track-event="`home:banner:${item.id}`"
				/>

				<div class="container">
					<div class="-main">
						<div v-if="item.front_url" class="-logo">
							<img class="-img" style="display: inline-block" :src="item.front_url" alt="" />
						</div>

						<div
							class="-info"
							:class="{
								'-info-full': !item.front_url,
							}"
						>
							<p class="lead">
								{{ item.content }}
							</p>

							<div class="-controls">
								<template v-if="item.game">
									<app-button
										v-if="item.custom_url"
										solid
										:href="item.custom_url"
										target="_blank"
										v-app-track-event="`home:banner:custom-${item.game.id}`"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewGame"
										solid
										:to="location"
										v-app-track-event="`home:banner:${item.game.id}`"
									>
										<translate>View Game</translate>
									</app-button>

									<app-game-follow-widget
										v-if="shouldShowFollowGame"
										:game="item.game"
										solid
										primary
										v-app-track-event="`home:banner:follow-${item.game.id}`"
									/>
								</template>
								<template v-else-if="item.community">
									<app-button
										v-if="item.custom_url"
										solid
										:href="item.custom_url"
										target="_blank"
										v-app-track-event="`home:banner:custom-community-${item.community.path}`"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewCommunity"
										solid
										:to="location"
										v-app-track-event="`home:banner:community-${item.community.path}`"
									>
										<translate>View Community</translate>
									</app-button>

									<app-community-join-widget
										v-if="shouldShowJoinCommunity"
										:community="item.community"
										solid
										primary
										event-label="home-banner"
									/>
								</template>
								<template v-else-if="item.jam">
									<app-button
										v-if="shouldShowJamViewGames"
										primary
										solid
										:to="location"
										v-app-track-event="`home:banner:${item.jam.id}`"
									>
										<translate>View Games</translate>
									</app-button>
									<app-button
										solid
										:href="item.jam.fullUrl"
										target="_blank"
										v-app-track-event="`home:banne:jam-${item.jam.id}`"
									>
										<translate>View Jam Page</translate>
									</app-button>
								</template>
							</div>
						</div>
					</div>
				</div>
			</section>
		</app-media-item-backdrop>
	</app-theme>
</template>

<style lang="stylus" src="./banner.styl" scoped></style>

<script lang="ts" src="./banner"></script>
