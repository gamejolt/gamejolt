<template>
	<div class="route-game-overview">
		<!-- Media Bar -->
		<app-media-bar v-if="game.media_count" :media-items="mediaItems" />

		<app-ad-placement class="-cover-ad" hidden-xs pos="top" />

		<section class="section">
			<app-page-container xl>
				<app-discover-games-view-overview-statbar slot="left" />

				<div v-if="!Screen.isMobile && game.comments_enabled" slot="left-bottom">
					<br />
					<div class="pull-right">
						<app-button trans @click="showComments()">
							<translate>View All</translate>
						</app-button>
					</div>

					<h4 class="section-header">
						<translate>Comments</translate>
						<small v-if="commentsCount > 0">({{ commentsCount | number }})</small>
					</h4>

					<app-comment-add-button resource="Game" :resource-id="game.id" displayMode="comments" />

					<app-comment-overview
						:comments="overviewComments"
						resource="Game"
						:resource-id="game.id"
						displayMode="comments"
						@reload-comments="reloadPreviewComments"
					/>
				</div>

				<div slot="right" v-if="!Screen.isMobile">
					<app-ad-widget
						class="-recommended-ad"
						v-if="shouldShowAds"
						size="rectangle"
						pos="bottom"
					/>

					<h4 class="section-header">
						<translate>Recommended</translate>
					</h4>

					<app-discover-games-view-overview-recommended />
				</div>

				<!--
				Convenience Messaging
				This needs to be a div instead of a template or vue 2.4.4 complains about a
				patched vnode not existing.
			-->
				<div v-if="customGameMessages.length">
					<div key="wip" v-if="game.canceled" class="alert alert-notice full-bleed-xs" v-translate>
						This game was canceled, so the current version might be buggy or incomplete. You can
						still follow it if you'd like to be notified in the case that development continues.
					</div>

					<div
						v-for="msg of customGameMessages"
						class="alert full-bleed-xs"
						:class="{
							'alert-notice': msg.type === 'alert',
						}"
					>
						<app-jolticon icon="notice" />
						<span v-html="msg.message" />
					</div>

					<br class="hidden-xs" />
				</div>

				<!--
				Builds / Soundtrack
				This is a bit tricky. _has_packages doesn't yet take into account private packages.
				If the game has only private packages, this will still be set to true.
				We only use it to figure out if we should show the releases section while loading before
				we actually have the package data. Because of that, we only use it to figure out what to
				show while we're loading the section. After it's loaded in, we decide if it should show
				through the "hasReleasesSection" variable which has the correct data.
			-->
				<template v-if="(game._has_packages && !isOverviewLoaded) || hasReleasesSection">
					<div id="game-releases">
						<!--
						Partner Controls
					-->
						<app-card v-if="hasPartnerControls">
							<div class="card-content">
								<p>
									<translate tag="strong">This game is part of the Partner system!</translate>
									<translate>You can use this link for sharing the game.</translate>
								</p>
								<input class="form-control" :value="partnerLink" />
							</div>
							<div class="card-controls">
								<app-button primary @click="copyPartnerLink">
									<translate>Copy Partner Link</translate>
								</app-button>
								<app-button
									trans
									:to="{
										name: 'dash.analytics',
										params: { resource: 'Game', resourceId: game.id },
									}"
								>
									<translate>View Analytics</translate>
								</app-button>
							</div>
						</app-card>

						<div v-if="shouldShowMultiplePackagesMessage" class="alert alert-notice">
							<app-jolticon icon="notice" />
							<translate>
								There are multiple packages for your device. Please choose one below.
							</translate>
						</div>

						<app-lazy-placeholder :when="isOverviewLoaded">
							<div class="lazy-placeholder" style="height: 135px"></div>

							<div v-if="externalPackages.length">
								<app-game-external-package-card
									v-for="externalPackage of externalPackages"
									:key="`external-${externalPackage.id}`"
									:package="externalPackage"
								/>
							</div>

							<div v-if="packages.length">
								<app-game-package-card
									v-for="pkg of packages"
									:key="pkg.id"
									:game="game"
									:sellable="pkg._sellable"
									:package="pkg"
									:releases="pkg._releases"
									:builds="pkg._builds"
									:is-partner="!!userPartnerKey"
									:partner-key="partnerKey"
									:partner="partner"
								/>
							</div>

							<!--
							We want to key it by the game ID so that it
							resets completely when the page changes.
						-->
							<app-game-soundtrack-card
								v-if="songs.length"
								:key="game.id"
								:game="game"
								:songs="songs"
							/>
						</app-lazy-placeholder>
					</div>

					<app-discover-games-view-overview-supporters
						v-if="supporters.length > 0"
						:supporters="supporters"
						:supporterCount="supporterCount"
					/>

					<div class="-spacer" />
				</template>

				<div v-if="!isOverviewLoaded">
					<span class="lazy-placeholder"></span>
					<span class="lazy-placeholder"></span>
					<span class="lazy-placeholder"></span>
					<span class="lazy-placeholder" style="width: 40%"></span>
				</div>
				<div v-else>
					<!--
					Set a :key to let vue know that it should update
					this when the game changes.
				-->
					<app-fade-collapse
						:collapse-height="600"
						:is-open="showDetails || !postsCount"
						:animate="false"
						:key="game.description_compiled"
						@require-change="setCanToggleDescription"
						@expand="toggleDetails()"
					>
						<div class="game-compiled-description" v-html="game.description_compiled"></div>
					</app-fade-collapse>

					<div v-if="showDetails">
						<hr />
						<div class="row">
							<div class="col-sm-6">
								<app-discover-games-view-overview-details :game="game" />
							</div>
							<div class="col-sm-6">
								<app-lazy-placeholder :when="isOverviewLoaded">
									<div class="lazy-placeholder" style="height: 115px"></div>
									<app-game-ogrs :game="game" />
								</app-lazy-placeholder>
							</div>
						</div>
					</div>

					<div class="page-cut">
						<app-button
							trans
							@click="toggleDetails()"
							v-app-track-event="`game-profile:show-full-description`"
						>
							<translate v-if="!showDetails">Show More</translate>
							<translate v-else>Less</translate>
						</app-button>
					</div>
				</div>

				<div class="-spacer" />

				<app-post-add-button v-if="hasDevlogPerms" :game="game" @add="onPostAdded" />

				<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
				<template v-else>
					<app-activity-feed v-if="feed.hasItems" :feed="feed" show-ads />
					<div v-else class="alert">
						<translate>
							Nothing has been posted to this project page yet. Maybe check back later!
						</translate>
					</div>
				</template>
			</app-page-container>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-spacer
	spacer()

.-cover-ad >>> section
	padding-bottom: 0

.-recommended-ad
	width: 300px
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./overview"></script>
