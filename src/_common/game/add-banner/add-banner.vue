<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';

@Options({
	directives: {
		AppAuthRequired,
	},
})
export default class AppGameAddBanner extends Vue {}
</script>

<template>
	<div class="add-game-banner">
		<div class="-row container-xl">
			<div class="-message">
				<translate>
					Game Jolt's Store is an open platform to share your games with the world.
				</translate>
			</div>
			<div v-app-auth-required class="-button">
				<app-button solid :to="{ name: 'dash.games.add' }">
					<translate>Add Your Game</translate>
				</app-button>
			</div>
		</div>
		<hr />
	</div>
</template>

<style lang="stylus" scoped>
.add-game-banner
	.-row
		display: flex
		align-items: center
		flex-direction: row
		padding-top: $line-height-computed

	.-message
		flex: auto

	.-button
		flex: none
		margin-left: $grid-gutter-width
</style>
