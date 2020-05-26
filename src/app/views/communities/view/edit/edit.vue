<template>
	<div>
		<app-expand :when="shouldShowHeader">
			<app-page-header
				:cover-media-item="community.header"
				:cover-editable="canEditMedia"
				@edit-cover="showEditHeader()"
			>
				<!--  -->
				<!-- @edit-cover="showEditHeader()" -->
				<span slot="cover-edit-buttons">
					<translate v-if="!community.header">Upload Header</translate>
					<translate v-else>Change Header</translate>
				</span>

				<!-- <h1>
				<router-link :to="{ name: 'communities.view.overview' }">
					{{ community.name }}
				</router-link>
				<app-community-verified-tick :community="community" big />
			</h1> -->

				<!-- v-if="isEditing && canEditMedia" -->
				<!-- @click="showEditAvatar()" -->
				<!-- <app-editable-overlay slot="spotlight" v-if="false" class="-fill">
				<translate slot="overlay">Change</translate>
				<app-community-thumbnail-img :community="community" />
			</app-editable-overlay>
			<router-link v-else :to="{ name: 'communities.view.overview' }" slot="spotlight">
				<app-community-thumbnail-img :community="community" />
			</router-link> -->
			</app-page-header>
		</app-expand>

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

		<router-view />
	</div>
</template>

<script lang="ts" src="./edit"></script>
