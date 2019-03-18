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
					<h1 v-if="section !== 'by-date'">
						{{ routeTitle }}
					</h1>
					<h1 v-else>
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
					</h1>

					<template v-if="tag">
						<p class="text-muted small" v-if="section === 'featured'">
							<translate :translate-params="{ tag: tag }">
								Featured %{ tag } games that we love on Game Jolt.
							</translate>
						</p>
						<p class="text-muted small" v-else-if="section === 'best'">
							<translate :translate-params="{ tag: tag }">
								Best %{ tag } games sorted by Voltage on Game Jolt.
							</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip="$gettext('games.list.voltage_tooltip')"
							/>
						</p>
						<p class="text-muted small" v-else-if="!section">
							<translate :translate-params="{ tag: tag }">
								New %{ tag } games sorted by Hotness on Game Jolt.
							</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip="$gettext('games.list.hotness_tooltip')"
							/>
						</p>
						<p class="text-muted small" v-else-if="section === 'new'">
							<translate :translate-params="{ tag: tag }">
								New %{ tag } games on Game Jolt.
							</translate>
						</p>
					</template>
					<template v-else>
						<p class="text-muted small" v-if="section === 'featured'">
							<translate>
								Featured games that we love on Game Jolt.
							</translate>
						</p>
						<p class="text-muted small" v-else-if="section === 'best'">
							<translate>
								Best games sorted by Voltage on Game Jolt.
							</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip="$gettext('games.list.voltage_tooltip')"
							/>
						</p>
						<p class="text-muted small" v-else-if="!section">
							<translate>
								New games sorted by Hotness on Game Jolt.
							</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip="$gettext('games.list.hotness_tooltip')"
							/>
						</p>
						<p class="text-muted small" v-else-if="section === 'new'">
							<translate>
								New games on Game Jolt, sorted by publication date.
							</translate>
						</p>
						<p class="text-muted small" v-else-if="section === 'by-date'">
							<template v-if="!dateRange">
								<translate :translate-params="{ date }">
									Games that were published on %{ date }, sorted by Voltage, with the best scores at
									the top.
								</translate>
							</template>
							<template v-else>
								<translate
									:translate-params="{
										dateStart: dateRange[0],
										dateEnd: dateRange[1],
									}"
								>
									Games that were published between %{ dateStart } and %{ dateEnd }, sorted by
									Voltage, with the best scores at the top.
								</translate>
							</template>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip="$gettext('games.list.voltage_tooltip')"
							/>
						</p>
					</template>
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
					games.list.new_games_warning_html
				</div>
			</div>

			<app-game-grid :games="listing.games" :show-ads="true" event-label="browse-games" />
		</app-game-listing>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$-spotlight-size = 58px

@media $media-sm-up
	.-spotlight
		float: left
		width: $-spotlight-size
		height: $-spotlight-size

	.-has-spotlight .-header-content
		margin-left: $-spotlight-size + $grid-gutter-width
</style>

<script lang="ts" src="./list" />
