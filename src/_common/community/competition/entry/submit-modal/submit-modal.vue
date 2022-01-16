<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../api/api.service';
import { Game } from '../../../../game/game.model';
import AppGameThumbnailImg from '../../../../game/thumbnail-img/thumbnail-img.vue';
import AppGameThumbnail from '../../../../game/thumbnail/thumbnail.vue';
import { showErrorGrowl } from '../../../../growls/growls.service';
import AppLoading from '../../../../loading/loading.vue';
import { BaseModal } from '../../../../modal/base';
import { CommunityCompetition } from '../../competition.model';
import { CommunityCompetitionEntry } from '../entry.model';

@Options({
	components: {
		AppLoading,
		AppGameThumbnailImg,
		AppGameThumbnail,
	},
})
export default class AppCommunityCompetitionEntrySubmitModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;

	games: Game[] = [];
	isLoading = true;
	selectedGame: Game | null = null;
	isSubmitting = false;

	readonly Game = Game;

	get hasSelectedGame() {
		return this.selectedGame !== null;
	}

	mounted() {
		this.loadGames();
	}

	private async loadGames() {
		this.isLoading = true;

		const payload = await Api.sendRequest(
			`/web/communities/competitions/entries/list-games/${this.competition.id}`
		);

		if (payload.games) {
			this.games = Game.populate(payload.games);
		}

		this.isLoading = false;
	}

	onClickSelectGame(game: Game) {
		this.selectedGame = game;
	}

	async onClickSubmit() {
		if (!this.selectedGame || this.isSubmitting) {
			return;
		}

		this.isSubmitting = true;

		try {
			const payload = await Api.sendRequest(
				`/web/communities/competitions/entries/submit-game/${this.competition.id}/${this.selectedGame.id}`,
				{},
				{
					noErrorRedirect: true,
				}
			);

			if (payload.success) {
				const entry = new CommunityCompetitionEntry(payload.entry);
				this.modal.resolve(entry);
			} else {
				console.error(payload);
				throw new Error('Payload error');
			}
		} catch (error) {
			showErrorGrowl(this.$gettext(`Could not submit your game to the jam :(`));

			// Reset modal, try again?
			this.selectedGame = null;
			this.games = [];
			this.loadGames();
		}

		this.isSubmitting = false;
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Choose a game to submit</translate>
			</h2>
		</div>
		<div class="modal-body">
			<app-loading v-if="isLoading" centered />
			<template v-else-if="selectedGame">
				<app-game-thumbnail
					:game="selectedGame"
					class="-game-thumb-selected"
					hide-pricing
					hide-controls
				/>
				<p class="help-block">
					<translate>
						Before submitting, make sure that you have read and understood the rules of
						the jam.
					</translate>
				</p>
				<app-button solid primary @click="onClickSubmit">
					<translate>Submit</translate>
				</app-button>
			</template>
			<template v-else-if="games.length">
				<div v-for="game of games" :key="game.id" class="-game">
					<div class="-game-thumb">
						<app-game-thumbnail-img :game="game" />
					</div>

					<div class="-game-label">
						<div class="-game-title">{{ game.title }}</div>
					</div>

					<div class="-game-button">
						<app-button primary @click="onClickSelectGame(game)">
							<translate>Select</translate>
						</app-button>
					</div>
				</div>
			</template>
			<div v-else class="alert">
				<p>
					<translate>You have no games available to be submitted.</translate>
				</p>
				<p v-translate>
					To enter a game into the jam, upload it to Game Jolt first,
					<b>make sure it is published</b>, then return to this page.
				</p>
				<app-button :to="{ name: 'dash.games.add' }">
					<translate>Add Game</translate>
				</app-button>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
$-v-padding = 15px
$-h-padding = 20px
$-height = 44px

.-game
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid

	&:last-child
		border-bottom: 0

	&-thumb
		flex: none
		width: $-height * 2
		margin-right: $-h-padding

		&-selected
			margin-bottom: 0 !important
			max-width: 300px

	&-label
		flex: auto
		overflow: hidden

	&-title
	&-hidden
		text-overflow()

	&-title
		font-weight: bold

	&-button
		flex: none
		margin-left: $-h-padding

.-back
	display: inline-block
	margin-bottom: 12px
	cursor: pointer

	*
		vertical-align: middle
</style>
