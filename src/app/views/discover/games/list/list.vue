<template>
	<div>
		<app-page-header>
			<!--
			Animation scope.
		-->
			<div
				:class="{
					'-has-spotlight': spotlight,
				}"
				:key="section + (tag || '')"
			>
				<img
					v-if="spotlight"
					class="-spotlight hidden-xs anim-fade-in-enlarge"
					:src="spotlight"
					alt=""
				/>

				<div class="-header-content anim-fade-in-right">
					<h1>
						<template v-if="section !== 'by-date'">
							{{ listTitle }}
						</template>
						<template v-else>
							<template v-if="!dateRange">
								<span v-translate="{ date }">
									Games published
									<small>on %{ date }</small>
								</span>
							</template>
							<template v-else>
								<span
									v-translate="{
										dateStart: dateRange[0],
										dateEnd: dateRange[1],
									}"
								>
									Games published
									<small>between %{ dateStart } and %{ dateEnd }</small>
								</span>
							</template>
						</template>
					</h1>

					<p class="-list-desc text-muted small">
						{{ listDescription }}
					</p>
				</div>
			</div>
		</app-page-header>

		<section class="fill-dark" v-if="section !== 'by-date'">
			<app-tag-list />
		</section>

		<app-game-listing
			v-if="listing"
			:listing="listing"
			:include-featured-section="true"
			:hide-section-nav="section === 'by-date'"
			:is-loading="isRouteLoading"
		>
			<div class="alert alert-info anim-fade-in-enlarge" v-if="section === 'new'">
				<div v-translate>
					Newly added games are not moderated, curated, or vetted by the community. You can find a
					goldmine of undiscovered talent or you may see some of the scariest shit of your life.
				</div>
			</div>

			<app-game-grid :games="listing.games" :show-ads="true" event-label="browse-games" />
		</app-game-listing>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$-spotlight-size = 58px

.-list-desc
	margin-top: 4px

@media $media-sm-up
	.-spotlight
		float: left
		width: $-spotlight-size
		height: $-spotlight-size

	.-has-spotlight .-header-content
		margin-left: $-spotlight-size + $grid-gutter-width
</style>

<script lang="ts" src="./list"></script>
