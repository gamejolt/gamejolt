<template>
	<div class="trophy-overview">
		<h2 :class="{ 'section-header': Screen.isDesktop || size === 'full' }">
			<router-link
				class="link-unstyled"
				:to="{
					name: 'discover.games.view.trophies.list',
					params: { slug: game.slug, id: game.id },
				}"
			>
				<translate>trophies.overview.heading</translate>
			</router-link>
			<small>({{ trophies.length | number }})</small>
		</h2>

		<hr class="underbar" />

		<!--
		If a user is logged in, then we show the completion widget. In that case
		we throw it on the right side on LG screens. We have to adjust the
		columns accordingly. This only applies to full-sized overview.
	-->
		<div class="row">
			<!--
			Trophy completion is only needed if they are logged in.
		-->
			<div
				class="col-xs-12"
				:class="size == 'full' ? 'col-lg-6 col-lg-push-6' : ''"
				v-if="app.user"
			>
				<app-trophy-completion
					class="full-bleed-xs"
					:total="trophies.length"
					:achieved="achieved.length"
					:experience="experience"
				/>
			</div>

			<div class="col-xs-12" :class="app.user && size === 'full' ? 'col-lg-6 col-lg-pull-6' : ''">
				<!--
				Trophy thumbnail sizes depend on whether or not we're showing
				full size, whether or not they're logged in, and their screen
				size. Test all of these when making changes.
			-->
				<div class="trophy-grid row">
					<div
						class="trophy-grid-item col-xs-4 col-sm-2"
						:class="desktopThumbSizes"
						v-for="trophy of trophies.slice(0, numberToShow)"
						:key="trophy.id"
					>
						<app-trophy-thumbnail :trophy="trophy" :is-achieved="!!achievedIndexed[trophy.id]" />
					</div>
				</div>

				<p v-if="extraCount">
					<router-link
						class="link-muted small"
						:to="{
							name: 'discover.games.view.trophies.list',
							params: { slug: game.slug, id: game.id },
						}"
					>
						<translate :translate-params="{ count: number(extraCount) }">
							+%{ count } more
						</translate>
					</router-link>
				</p>

				<div class="alert alert-notice" v-if="showInvisibleTrophyMessage">
					<translate>trophies.invisible_trophies_message</translate>
				</div>

				<p>
					<app-button
						blockXs
						:to="{
							name: 'discover.games.view.trophies.list',
							params: { slug: game.slug, id: game.id },
						}"
					>
						<translate>trophies.overview.view_more_button</translate>
					</app-button>
				</p>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$trophy-grid-gutter = 20px

.row.trophy-grid
	margin-left: ($trophy-grid-gutter / -2)
	margin-right: ($trophy-grid-gutter / -2)

.trophy-grid-item
	padding-left: ($trophy-grid-gutter / 2)
	padding-right: ($trophy-grid-gutter / 2)
	margin-bottom: $trophy-grid-gutter
</style>

<script lang="ts" src="./overview" />
