<script lang="ts" src="./competition"></script>

<template>
	<div>
		<app-loading v-if="isLoading" centered class="-loading" />

		<template v-else>
			<app-page-header
				:cover-media-item="competition.header"
				should-affix-nav
				:cover-max-height="250"
			>
				<template #default>
					<div class="row">
						<div class="col-sm-8">
							<h1 class="section-header">
								{{ channel.displayTitle }}
							</h1>

							<p class="text-muted small">
								<span v-if="channel.visibility === 'draft'" class="tag">
									<translate>Draft</translate>
								</span>
								<span v-else-if="channel.visibility === 'unlisted'" class="tag">
									<translate>Unlisted</translate>
								</span>
								<span v-else-if="channel.visibility === 'published'" class="tag">
									<translate>Published</translate>
								</span>
							</p>
						</div>
						<div class="col-sm-4">
							<app-button
								:to="{
									name: 'communities.view.channel.feed',
									params: { channel: channel.title },
								}"
								icon="arrow-forward"
							>
								<translate>View Jam</translate>
							</app-button>
						</div>
					</div>
				</template>

				<template #nav>
					<nav class="platform-list inline">
						<ul>
							<li>
								<router-link
									:to="{ name: 'communities.view.edit.competition.channel' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.competition.channel',
									}"
								>
									<translate>Channel</translate>
								</router-link>
							</li>
							<li>
								<router-link
									:to="{ name: 'communities.view.edit.competition.details' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.competition.details',
									}"
								>
									<translate>Details</translate>
								</router-link>
							</li>
							<li>
								<router-link
									:to="{ name: 'communities.view.edit.competition.games' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.competition.games',
									}"
								>
									<translate>Games</translate>
								</router-link>
							</li>
							<li>
								<router-link
									:to="{ name: 'communities.view.edit.competition.voting' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.competition.voting',
									}"
								>
									<translate>Voting</translate>
									<template v-if="competition">
										<span v-if="competition.is_voting_enabled" class="tag">
											<translate>On</translate>
										</span>
										<span v-else class="tag">
											<translate>Off</translate>
										</span>
									</template>
								</router-link>
							</li>
						</ul>
					</nav>
				</template>
			</app-page-header>

			<router-view />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-loading
	padding-top: 32px
</style>
