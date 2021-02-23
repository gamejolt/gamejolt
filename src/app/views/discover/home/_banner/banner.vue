<script lang="ts" src="./banner"></script>

<template>
	<div v-if="!item || isLoading" class="-placeholder" />
	<app-theme v-else :theme="theme">
		<app-media-item-backdrop class="-backdrop" :media-item="bannerMediaItem">
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
							<p class="lead">
								{{ item.content }}
							</p>

							<div class="-controls">
								<template v-if="item.game">
									<app-button
										v-if="item.custom_url"
										v-app-track-event="`home:banner:custom-${item.game.id}`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewGame"
										v-app-track-event="`home:banner:${item.game.id}`"
										solid
										:to="location"
									>
										<translate>View Game</translate>
									</app-button>

									<app-game-follow-widget
										v-if="shouldShowFollowGame"
										v-app-track-event="`home:banner:follow-${item.game.id}`"
										:game="item.game"
										solid
										primary
									/>
								</template>
								<template v-else-if="item.community">
									<app-button
										v-if="item.custom_url"
										v-app-track-event="
											`home:banner:custom-community-${item.community.path}`
										"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
									</app-button>

									<app-button
										v-if="shouldShowViewCommunity"
										v-app-track-event="
											`home:banner:community-${item.community.path}`
										"
										solid
										:to="location"
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
								<template v-else-if="item.custom_url">
									<app-button
										v-app-track-event="`home:banner:custom`"
										solid
										:href="item.custom_url"
										target="_blank"
									>
										{{ item.custom_text }}
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
