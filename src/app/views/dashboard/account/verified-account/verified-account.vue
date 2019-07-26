<template>
	<div>
		<template v-if="isVerified">
			<!--
				Normally, users won't see this, no need to make it extra pretty.
				The verification menu item is hidden if the user is already verified.
			-->
			<h2 class="section-header">
				<app-user-verified-tick :user="app.user" big vertical-align />
				<translate>Your account is already verified! Congratulations!</translate>
			</h2>
			<router-link :to="{ name: 'dash.account.edit' }">
				<app-button>
					<translate>Back to profile</translate>
				</app-button>
			</router-link>
		</template>
		<template v-else>
			<!--
				Nothing in this section should be translated.
				All text should stay English, to match the requested language of the Application Text form input.
			-->
			<h2 class="section-header">
				Submit your account verification application
			</h2>
			<template v-if="list">
				<div class="well fill-offset">
					In order to have your account verified, you need to complete as many tasks as possible
					from the following list.
					<br />
					<app-jolticon icon="exclamation-circle" notice />
					marks tasks that are required before you can submit your application.
					<br />
					<br />
					Please note that these requirements are
					<strong>guidelines</strong>
					for your presence on Game Jolt. Before making a decision, we review your profile manually.
				</div>

				<div class="-list">
					<div v-for="entry of list" :key="entry.title" class="-list-entry">
						<div class="-list-entry-check">
							<app-jolticon
								:icon="entry.check ? 'checkbox' : 'box-empty'"
								v-app-tooltip="entry.check ? `Completed` : ``"
							/>
						</div>
						<div>
							<div>
								<app-jolticon
									v-if="entry.required && !entry.check"
									icon="exclamation-circle"
									notice
									v-app-tooltip="`Required`"
								/>
								<strong>{{ entry.title }}</strong>
							</div>
							<span class="text-muted">{{ entry.description }}</span>
						</div>
					</div>
				</div>
			</template>

			<form-verified-account
				v-if="bootstrappedApplication"
				:model="application"
				:user="app.user"
				:canSubmit="canApply"
				@submit="onSubmitApplication"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-list-entry
	display: flex
	align-items: center
	margin-bottom: ($grid-gutter-width / 2)

.-list-entry-check
	margin-right: 16px

.-list
	margin-bottom: $grid-gutter-width

</style>

<script lang="ts" src="./verified-account"></script>
