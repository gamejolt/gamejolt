<script lang="ts" src="./entries"></script>

<template>
	<div class="container">
		<div class="row">
			<div class="col-sm-9">
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
					<router-view />
				</template>
			</div>

			<div class="col-sm-3">
				<template v-if="shouldShowUserSubmissions">
					<h3 class="sans-margin-top">
						<translate>Your submissions</translate>
					</h3>

					<template v-if="canSubmitEntry">
						<p v-if="!hasSubmittedEntries">
							<translate>
								You have not submitted an entry to this jam... yet?
							</translate>
						</p>

						<app-button icon="add" @click="onClickSubmit">
							<translate>Submit an entry</translate>
						</app-button>
					</template>
					<template v-else-if="competition.periodNum >= 2">
						<p class="help-block">
							<translate>
								The Jam has ended and submissions are now closed.
							</translate>
						</p>
					</template>
					<template v-else-if="channel.visibility === 'draft'">
						<p v-if="!hasSubmittedEntries" class="help-block">
							<translate>
								The channel for this Jam is a "Draft". Publish the Jam to open
								submissions.
							</translate>
						</p>
					</template>

					<div v-if="hasSubmittedEntries" class="-user-entries">
						<app-community-competition-entry-thumbnail
							v-for="entry of userEntries"
							:key="entry.id"
							:entry="entry"
							show-remove
							@remove="onEntryRemoved(entry)"
						/>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-user-entries
	margin-top: 32px
</style>
