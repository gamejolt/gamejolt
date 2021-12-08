<script lang="ts" src="./jam"></script>

<template>
	<div>
		<app-communities-view-page-container full>
			<app-community-perms :community="community" perms="community-competitions">
				<app-button
					icon="edit"
					:to="{
						name: 'communities.view.edit.channels.competition.overview',
						params: { id: community.id },
					}"
				>
					<translate>Edit Jam</translate>
				</app-button>
				<hr />
			</app-community-perms>

			<div class="-header">
				<div class="-header-title">
					<h1 :class="{ 'text-center': Screen.isXs, h2: Screen.isMobile }">
						{{ channel.displayTitle }}
					</h1>

					<div v-if="!competition.hasEnded" class="-header-subtitle text-muted">
						Submissions are open <b>{{ formatDate(competition.starts_on) }}</b> to
						<b>{{ formatDate(competition.ends_on) }}</b>
					</div>
				</div>
				<div class="-header-end">
					<div class="-header-meta">
						<app-community-competition-countdown :competition="competition" />
					</div>
					<div v-if="canSubmitEntry" class="-header-actions">
						<app-button primary solid @click="onClickSubmit">
							<translate>Submit an entry</translate>
						</app-button>
					</div>
				</div>
			</div>

			<div v-if="channel.description_content" class="sheet sheet-elevate">
				<app-fade-collapse
					:collapse-height="500"
					:is-open="isDescriptionOpen"
					@require-change="canToggleDescriptionChanged"
				>
					<app-content-viewer :source="channel.description_content" />
				</app-fade-collapse>

				<div v-if="canToggleDescription" class="page-cut page-cut-no-margin">
					<app-button trans @click="toggleDescription()">
						<translate v-if="!isDescriptionOpen">Show More</translate>
						<translate v-else>Less</translate>
					</app-button>
				</div>
			</div>

			<template v-if="shouldShowUserSubmissions">
				<h2>
					<translate>Your submissions</translate>

					<div v-if="canSubmitEntry" class="-submission-button">
						<app-button @click="onClickSubmit">
							<translate>Submit an entry</translate>
						</app-button>
					</div>
				</h2>

				<template v-if="canSubmitEntry">
					<p v-if="!hasSubmittedEntries" class="help-block">
						<translate>You have not submitted an entry to this jam... yet?</translate>
					</p>
				</template>
				<template v-else-if="competition.period === 'pre-comp'">
					<p class="help-block">
						<translate>
							You'll be able to submit your entry from this page once the jam starts.
						</translate>
					</p>
				</template>
				<template v-else-if="competition.periodNum >= 2">
					<p class="help-block">
						<translate>The jam has ended and submissions are now closed.</translate>
					</p>
				</template>
				<template v-else-if="channel.visibility === 'draft'">
					<p v-if="!hasSubmittedEntries" class="help-block">
						<translate>
							The jam is set up as a draft. Publish the jam to open submissions.
						</translate>
					</p>
				</template>
				<template v-else-if="channel.is_archived">
					<p class="help-block">
						<translate>
							This channel is archived and entries cannot be submitted.
						</translate>
					</p>
				</template>

				<div v-if="hasSubmittedEntries">
					<app-community-competition-entry-grid
						:competition="competition"
						:num-placeholders="2"
						:entries="userEntries"
						show-remove
						@remove="onEntryRemoved($event)"
					/>
				</div>

				<br />
			</template>

			<template v-if="competition.hasStarted">
				<route-communities-view-channel-jam-entries :categories="categories" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-header
	display: flex
	flex-direction: column
	align-items: center

	&-title
		flex: auto
		margin-bottom: $line-height-computed

		h1
			margin-top: 0

	&-end
		display: flex
		flex-direction: column
		align-items: center

	&-meta
		flex: none
		text-align: center

	&-actions
		flex: none
		margin-bottom: $line-height-computed

	@media $media-sm-up
		flex-direction: row
		align-items: flex-start

		&-title
			h1
				margin-bottom: 0

		&-subtitle
			margin-top: $line-height-computed

		&-end
			flex: none
			display: flex
			flex-direction: column
			align-items: flex-end
			margin-left: ($grid-gutter-width / 2)

		&-meta
			text-align: left

	@media $media-md-up
		&-subtitle
			margin-top: 0

		&-end
			flex-direction: row
			align-items: flex-start

		&-actions
			margin-left: ($grid-gutter-width / 2)

@media $media-sm-up
	.-submission-button
		display: inline-block
		margin-left: $grid-gutter-width
</style>
