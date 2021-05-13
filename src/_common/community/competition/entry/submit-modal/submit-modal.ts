import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../api/api.service';
import { Game } from '../../../../game/game.model';
import AppGameThumbnailImg from '../../../../game/thumbnail-img/thumbnail-img.vue';
import AppGameThumbnail from '../../../../game/thumbnail/thumbnail.vue';
import { Growls } from '../../../../growls/growls.service';
import AppLoading from '../../../../loading/loading.vue';
import { BaseModal } from '../../../../modal/base';
import { CommunityCompetition } from '../../competition.model';
import { CommunityCompetitionEntry } from '../entry.model';

@Component({
	components: {
		AppLoading,
		AppGameThumbnailImg,
		AppGameThumbnail,
	},
})
export default class AppCommunityCompetitionEntrySubmitModal extends BaseModal {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

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
			Growls.error(this.$gettext(`Could not submit your game to the jam :(`));

			// Reset modal, try again?
			this.selectedGame = null;
			this.games = [];
			this.loadGames();
		}

		this.isSubmitting = false;
	}
}
