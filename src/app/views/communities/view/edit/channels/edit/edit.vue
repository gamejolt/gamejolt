<script lang="ts" src="./edit"></script>

<template>
	<div>
		<app-page-header v-bind="pageHeaderProps" should-affix-nav @edit-cover="onClickEditHeader">
			<template v-if="canEditHeader" #cover-edit-buttons>
				<translate>Upload Header</translate>
			</template>

			<template #default>
				<div class="text-muted small">
					<span v-if="channel.visibility === 'draft'" class="tag">
						<translate>Draft</translate>
					</span>
					<span v-else-if="channel.visibility === 'published'" class="tag tag-highlight">
						<translate>Published</translate>
					</span>

					<template v-if="competition">
						<span v-if="competition.period === 'pre-comp'" class="tag">
							<translate>Future</translate>
						</span>
						<span
							v-else-if="competition.period === 'running'"
							class="tag tag-highlight"
						>
							<translate>Running</translate>
						</span>
						<span v-else-if="competition.period === 'voting'" class="tag tag-highlight">
							<translate>Voting</translate>
						</span>
						<span v-else-if="competition.period === 'post-comp'" class="tag">
							<translate>Finished</translate>
						</span>
					</template>
				</div>

				<h1 class="section-header">
					{{ channel.displayTitle }}
				</h1>
			</template>

			<template #nav>
				<div class="-competition-nav">
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
							<li v-if="competition">
								<router-link
									:to="{
										name: 'communities.view.edit.channels.competition.overview',
									}"
									active-class="active"
								>
									<translate>Manage Jam</translate>
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
						block
						icon="arrow-forward"
					>
						<translate v-if="competition">View Jam</translate>
						<translate v-else>View Channel</translate>
					</app-button>
				</app-page-header-controls>
			</template>
		</app-page-header>

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
