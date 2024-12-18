<script lang="ts" setup>
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
</script>

<template>
	<div class="add-game-banner">
		<div class="-row container-xl">
			<div class="-message">
				<AppTranslate>
					Game Jolt's Store is an open platform to share your games with the world.
				</AppTranslate>
			</div>
			<div v-app-auth-required class="-button">
				<AppButton solid :to="{ name: 'dash.games.add' }">
					<AppTranslate>Add Your Game</AppTranslate>
				</AppButton>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.add-game-banner
	background-color: var(--theme-bg)

	.-row
		display: flex
		align-items: center
		flex-direction: row
		padding-top: 24px
		padding-bottom: 24px

	.-message
		flex: auto

	.-button
		flex: none
		margin-left: $grid-gutter-width
</style>
