import { darken } from 'polished';
<template>
	<div class="-welcome-page">
		<app-theme-svg
			class="-logo"
			src="~img/game-jolt-logo.svg"
			:width="logoWidth"
			:height="logoHeight"
			alt="Game Jolt"
		/>

		<section>
			<template v-if="isSkip">
				<app-button class="pull-right -muted" trans @click="onNext">
					<translate>Skip</translate>
				</app-button>
			</template>
			<template v-else>
				<app-button class="pull-right" icon="arrow-forward" @click="onNext">
					<translate>Next</translate>
				</app-button>
			</template>

			<h1 class="section-header">
				<translate :translate-params="{ name: app.user.username }">
					Welcome, @%{ name }!
				</translate>
			</h1>

			<p>
				<translate>
					Before you go spelunking, let's customize your profile.
				</translate>
			</p>

			<div class="-content">
				<div class="-avatar">
					<app-editable-overlay @click="showEditAvatar()">
						<translate slot="overlay">Change</translate>
						<app-user-avatar :user="app.user" />
					</app-editable-overlay>
				</div>

				<div class="-bio">
					<textarea
						ref="bio"
						class="form-control"
						:value="app.user.description_markdown"
						:placeholder="$gettext('Tell us about yourself')"
					></textarea>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-welcome-page
	theme-prop('background-color', 'darkest')

	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-logo
	width: 100%
	margin: 30px auto

section
	text-align: center
	margin: 30px auto

.-muted
	theme-prop('color', 'fg-muted')

.-content
	margin: 0 auto
	max-width: 700px
	display: flex
	justify-items: stretch

	h2
		margin-top: 0

.-avatar
	margin-right: 20px
	max-width: 200px
	width: 25%

	.editable-overlay
		border-radius: 50%
		overflow: hidden

.-bio
	width: 75%
	display: flex
	flex-direction: column

	textarea
		flex-grow: 1

</style>

<script lang="ts" src="./welcome"></script>
