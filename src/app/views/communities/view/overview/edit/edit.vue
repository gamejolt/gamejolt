<template>
	<div>
		<app-alert-dismissable
			v-if="isOwner"
			alert-type="info"
			:dismiss-key="`community-${community.id}.welcome-msg`"
		>
			<h2 class="section-header"><translate>Welcome to your new community! 🎉</translate></h2>

			<ul>
				<li>
					<p>
						<strong><translate>Your community is live!</translate></strong>
						<br />
						<translate>
							Users can already see and join your community on Game Jolt.
						</translate>
					</p>
				</li>

				<li>
					<strong><translate>Customize the %$@#! out of it</translate></strong>
					<br />
					<translate>
						You can edit every aspect of your community in this page. Set a description, upload a
						thumbnail and header, customize your channels - make it real pretty!
					</translate>
				</li>

				<li>
					<strong><translate>Assign moderators and collaborators</translate></strong>
					<br />
					<translate>
						Invite others to help you moderate and contribute to your community.
					</translate>
				</li>

				<li>
					<strong><translate>Get Featured</translate></strong>
					<br />
					<translate>
						Share your community with your friends, post about it on Reddit, Facebook, Twitter and
						Discord. Game Jolt staff will be looking for active communities to feature on the home
						page.
					</translate>
				</li>
			</ul>
		</app-alert-dismissable>

		<template v-if="isOwner && !!community.game">
			<app-communities-overview-edit-notice :community="community" />
			<div class="-spacer"></div>
		</template>

		<router-view @details-change="onDetailsChange" @channels-change="onChannelsChange" />
	</div>
</template>

<script lang="ts" src="./edit"></script>
