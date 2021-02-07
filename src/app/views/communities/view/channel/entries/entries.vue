<script lang="ts" src="./entries"></script>

<template>
	<div class="container">
		<div v-if="shouldShowUserSubmissions">
			<h3 class="section-header">
				<translate>Your submissions</translate>
			</h3>

			<template v-if="canSubmitEntry">
				<p v-if="!hasSubmittedEntries">
					<translate>You have not submitted an entry to this jam... yet?</translate>
				</p>

				<p>
					<app-button icon="add" @click="onClickSubmit">
						<translate>Submit an entry</translate>
					</app-button>
				</p>
			</template>
			<template v-else-if="competition.period === 'pre-comp'">
				<p class="help-block">
					<translate>Wait for the jam to start to submit your entry.</translate>
				</p>
			</template>
			<template v-else-if="competition.periodNum >= 2">
				<p class="help-block">
					<translate> The jam has ended and submissions are now closed. </translate>
				</p>
			</template>
			<template v-else-if="channel.visibility === 'draft'">
				<p v-if="!hasSubmittedEntries" class="help-block">
					<translate>
						The jam is set up as a draft. Publish the jam to open submissions.
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
		</div>

		<template v-if="!competition.entry_count">
			<app-illustration src="~img/ill/no-comments.svg">
				<p>
					<translate>
						Alas, no entries have been submitted to the jam...
					</translate>
				</p>
			</app-illustration>
		</template>
		<template v-else>
			<router-view :categories="categories" />
		</template>
	</div>
</template>
