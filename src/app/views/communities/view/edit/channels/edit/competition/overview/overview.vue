<script lang="ts" src="./overview"></script>

<template>
	<div>
		<h2 class="sans-margin-top">
			<translate>Jam Overview</translate>
		</h2>
		<p class="help-block">
			<!-- Starts on -->
			<span>
				<template v-if="competition.periodNum === 0">
					<translate>Your Jam will start in about</translate>
					<app-time-ago without-suffix is-future :date="competition.starts_on" />
				</template>
				<template v-else>
					<translate>Your Jam started about</translate>
					<app-time-ago :date="competition.starts_on" />
				</template>
			</span>

			<br />

			<!-- Ends on -->
			<span>
				<template v-if="competition.periodNum < 2">
					<translate>It will run for about</translate>
				</template>
				<template v-else>
					<translate>It ran for about</translate>
				</template>
				{{ competitionRuntime | duration('en') }}
			</span>

			<br />

			<!-- Voting ends on -->
			<span>
				<template v-if="competition.is_voting_enabled">
					<template v-if="competition.periodNum < 3">
						<translate>Voting will last for about</translate>
					</template>
					<template v-else>
						<translate>Voting lasted for about</translate>
					</template>
					{{ competitionVotingRuntime | duration('en') }}
				</template>
				<template v-else>
					<i><translate>Voting is disabled.</translate></i>
				</template>
			</span>
		</p>

		<div v-if="shouldShowCategoryWarning" class="alert alert-notice">
			<p>
				<span v-translate>
					Your Jam is set to let users vote on Voting Categories once the voting period
					starts. However, <b>no voting categories are set up</b>.
				</span>
			</p>
			<p>
				<span v-translate>
					You must set up voting categories before the Jam is over, or users
					<b>will not be able to vote on entries</b>.
				</span>
			</p>

			<app-button
				block
				overlay
				icon="edit"
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
			>
				<translate>Set up Voting Categories</translate>
			</app-button>
		</div>

		<div v-if="channel.visibility === 'draft'" class="alert alert-notice">
			<p>
				<span v-translate><b>This Jam is a draft</b> and only moderators can view it.</span>
			</p>
			<p>
				<translate>
					You can leave it as a draft and work on it, then publish it when you're ready
					for it to be visible in the community's channel list.
				</translate>
			</p>
			<app-button block overlay icon="active" @click="onClickPublish">
				<translate>Publish</translate>
			</app-button>
		</div>

		<table class="table">
			<tbody>
				<tr>
					<th>
						<translate>Jam Name</translate>
					</th>
					<td>
						{{ channel.displayTitle }}

						<app-jolticon
							v-app-tooltip="
								$gettext(`The Jam's name is the same as the channel display title`)
							"
							class="text-muted"
							icon="info-circle"
						/>
					</td>
				</tr>
				<tr>
					<th>
						<translate>URL</translate>
					</th>
					<td>
						<router-link :to="{ name: 'communities.view.channel.feed' }">
							{{ Environment.baseUrl + '/c/' + community.path + '/'
							}}<b>{{ channel.title }}</b>
						</router-link>
					</td>
				</tr>
				<tr>
					<th>
						<translate>Timezone</translate>
					</th>
					<td>
						<template v-if="competition.timezone">
							{{ competition.timezone }}
							<p class="help-block sans-margin-bottom">
								<translate>All jam times are based off this timezone.</translate>
							</p>
						</template>
						<template v-else>
							<span class="help-inline">
								<i><translate>No timezone selected</translate></i>
							</span>
						</template>
					</td>
				</tr>
				<tr>
					<th>
						<translate>Start Date and Time</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.starts_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
				<tr>
					<th>
						<translate>End Date and Time</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.ends_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
				<tr v-if="competition.is_voting_enabled">
					<th>
						<translate>Voting End Date and Time</translate>
					</th>
					<td>
						<app-community-competition-date
							:date="competition.voting_ends_on"
							:timezone="competition.timezone"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="stylus" scoped></style>
