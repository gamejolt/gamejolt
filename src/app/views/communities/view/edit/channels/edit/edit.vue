<script lang="ts" src="./edit"></script>

<template>
	<div>
		<app-page-header
			v-if="channel.type === 'competition'"
			:cover-media-item="competition.header"
			should-affix-nav
			:cover-max-height="250"
			cover-editable
		>
			<template #default>
				<h1 class="section-header">
					{{ channel.displayTitle }}
				</h1>

				<p class="text-muted small">
					<span v-if="channel.visibility === 'draft'" class="tag">
						<translate>Draft</translate>
					</span>
					<span v-else-if="channel.visibility === 'published'" class="tag tag-highlight">
						<translate>Published</translate>
					</span>

					<span v-if="competition.period === 'pre-comp'" class="tag">
						<translate>Future</translate>
					</span>
					<span v-else-if="competition.period === 'running'" class="tag tag-highlight">
						<translate>Running</translate>
					</span>
					<span v-else-if="competition.period === 'voting'" class="tag tag-highlight">
						<translate>Voting</translate>
					</span>
					<span v-else-if="competition.period === 'post-comp'" class="tag">
						<translate>Finished</translate>
					</span>
				</p>
			</template>

			<template #nav>
				<div class="-competition-nav">
					<app-button
						v-app-tooltip="$gettext(`Return to Channel List`)"
						class="-btn-back"
						trans
						sparse
						circle
						icon="chevron-left"
						:to="{ name: 'communities.view.edit.channels.list' }"
					/>
					<nav class="platform-list inline">
						<ul>
							<li>
								<router-link
									:to="{ name: 'communities.view.edit.channels.overview' }"
									:class="{
										active:
											$route.name ===
											'communities.view.edit.channels.overview',
									}"
								>
									<translate>Channel</translate>
								</router-link>
							</li>
							<li>
								<router-link
									:to="{
										name: 'communities.view.edit.channels.competition.overview',
									}"
									active-class="active"
								>
									<translate>Jam</translate>
								</router-link>
							</li>
						</ul>
					</nav>
				</div>
			</template>

			<template #controls>
				<app-page-header-controls>
					<app-button
						:to="{
							name: 'communities.view.channel.feed',
						}"
						icon="arrow-forward"
					>
						<translate>View Jam</translate>
					</app-button>
				</app-page-header-controls>
			</template>
		</app-page-header>

		<template v-else>
			<app-communities-view-page-container class="-nav-container">
				<nav class="breadcrumb">
					<ul>
						<li>
							<router-link :to="{ name: 'communities.view.edit.channels.list' }">
								<span class="breadcrumb-tag">&nbsp;</span>
								<translate>Channels</translate>
							</router-link>
							<app-jolticon icon="chevron-right" class="breadcrumb-separator" />
						</li>
						<li>
							<span class="active">
								<span class="breadcrumb-tag">
									<translate>channel</translate>
								</span>
								{{ channel.displayTitle }}
							</span>
						</li>
					</ul>
				</nav>
			</app-communities-view-page-container>
		</template>

		<router-view />
	</div>
</template>

<style lang="stylus" scoped>
.-nav-container
	padding-bottom: 0

.-competition-nav
	display: flex
	align-items: center

.-btn-back
	margin-right: 32px
</style>
