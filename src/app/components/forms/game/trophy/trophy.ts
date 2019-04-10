import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import { BaseForm, FormOnInit, FormOnLoad } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameTrophy } from 'game-jolt-frontend-lib/components/game/trophy/trophy.model';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppImgResponsive,
		AppFormControlToggle,
		AppFormControlUpload,
	},
})
export default class FormGameTrophy extends BaseForm<GameTrophy> implements FormOnInit, FormOnLoad {
	@Prop(Game) game!: Game;
	@Prop(Number) difficulty!: number;

	modelClass = GameTrophy;
	resetOnSubmit = true;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/developer/games/api/trophies/save/${this.game.id}`;
	}

	get difficultyOptions() {
		return [
			{
				label: this.$gettext('trophies.bronze'),
				value: GameTrophy.DIFFICULTY_BRONZE,
			},
			{
				label: this.$gettext('trophies.silver'),
				value: GameTrophy.DIFFICULTY_SILVER,
			},
			{
				label: this.$gettext('trophies.gold'),
				value: GameTrophy.DIFFICULTY_GOLD,
			},
			{
				label: this.$gettext('trophies.platinum'),
				value: GameTrophy.DIFFICULTY_PLATINUM,
			},
		];
	}

	onInit() {
		this.setField('game_id', this.game.id);

		// If we're adding, set some defaults.
		if (this.method === 'add') {
			this.setField('difficulty', this.difficulty);
			this.setField('secret', false);
		}
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	async clearImage() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.trophies.form.clear_image_confirmation')
		);

		if (!result) {
			return;
		}

		// It's important we save on the base model!
		// This way we don't overwrite the form model with the current values from the server.
		// They may have made changes and just want to clear the image and then save their form.
		// Doing it in this order allows them to do that.
		await this.model!.$clearImage();

		// Copy just the differences that we want.
		this.setField('has_thumbnail', this.model!.has_thumbnail);
		this.setField('img_thumbnail', this.model!.img_thumbnail);
	}
}
