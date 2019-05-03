<template>
	<section class="well fill-dark">
		<!-- Stepper -->

		<h2 class="section-header">
			<translate>Welcome to Game Jolt!</translate>
		</h2>

		<p>
			<translate>
				Let's make you feel right at home, starting with customizing your profile.
			</translate>
		</p>

		<template v-if="app.user">
			{{ app.user.username }}

			<app-user-avatar :user="app.user" />
		</template>
	</section>
</template>

<style lang="stylus" scoped>
.-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>

<script lang="ts" src="./welcome"></script>
