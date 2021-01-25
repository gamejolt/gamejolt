<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>{{ title }}</translate>
			</h2>
		</div>
		<div class="modal-body">
			<template v-if="!!m_entry">
				<div class="row">
					<div class="col-sm-8 -entry-info">
						<div class="-section">
							<div class="pull-right">
								<app-user-card-hover :user="author">
									<app-user-avatar class="-author-avatar" :user="author" />
								</app-user-card-hover>
							</div>
							<div>
								<div class="-author-name">
									<translate>By</translate>
									<app-user-card-hover class="-hover-card" :user="author">
										<router-link
											:to="{
												name: 'profile.overview',
												params: { username: author.username },
											}"
										>
											{{ author.display_name }}
											<app-user-verified-tick :user="author" />
										</router-link>
									</app-user-card-hover>
								</div>
								<div class="-entered-date">
									<translate>Entered on</translate>
									<b>{{ m_entry.added_on | date('short') }}</b>
									<i class="text-muted">
										(<app-time-ago :date="m_entry.added_on" strict />)
									</i>
								</div>
							</div>
						</div>

						<!-- Right column hidden on mobile, show inline -->
						<div v-if="Screen.isMobile" class="-section">
							<router-link :to="m_entry.resource.routeLocation">
								<app-game-thumbnail-img
									class="-game-thumb"
									:game="m_entry.resource"
								/>
							</router-link>

							<app-button
								block
								icon="chevron-right"
								:to="m_entry.resource.routeLocation"
							>
								<translate>View Game</translate>
							</app-button>
						</div>

						<div class="-section">
							<template v-if="competition">
								<app-community-competition-voting-widget
									:competition="competition"
									:entry="entry"
									:voting-categories="votingCategories"
								/>
							</template>
							<app-loading v-else centered />
						</div>
					</div>

					<!-- Show thumbnail on the right column on desktop -->
					<div v-if="Screen.isDesktop" class="col-sm-4">
						<router-link :to="m_entry.resource.routeLocation">
							<app-game-thumbnail-img class="-game-thumb" :game="m_entry.resource" />
						</router-link>

						<app-button block icon="chevron-right" :to="m_entry.resource.routeLocation">
							<translate>View Game</translate>
						</app-button>
					</div>
				</div>
			</template>

			<app-loading v-else centered />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-section
	margin-bottom: 24px

.-entry-info
	margin-bottom: 24px

.-author
	&-name
		font-size: $font-size-large

	&-avatar
		width: 46px

.-hover-card
	display: inline-block !important

.-entered-date
	font-size: $font-size-small

.-game-thumb
	margin-bottom: 16px
</style>
