import { Component, Prop } from 'vue-property-decorator';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/embed.vue';

@Component({
	components: {
		AppSketchfabEmbed,
	},
})
export default class FormGameSketchfab extends BaseForm<GameSketchfab>
	implements FormOnInit, FormOnSubmit {
	@Prop(Game) game!: Game;

	readonly SKETCHFAB_URL_REGEX_1 = /^(?:(?:https:\/\/)?(?:www.)?(?:sketchfab.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$/i;
	readonly SKETCHFAB_URL_REGEX_2 = /^(?:(?:https:\/\/)?(?:www.)?(?:sketchfab.com\/models\/([0-9a-f]{32})\/?))$/i;
	readonly SKETCHFAB_FIELD_REGEX = /^(?:(?:https:\/\/)?(?:www.)?(?:sketchfab.com\/3d-models\/(?:[a-z0-9]+-)+([0-9a-f]{32})\/?))$|^(?:(?:https:\/\/)?(?:www.)?(?:sketchfab.com\/models\/([0-9a-f]{32})\/?))$|^([0-9a-f]{32})$/i;

	modelClass = GameSketchfab;
	resetOnSubmit = true;
	warnOnDiscard = false;

	get sketchfabId() {
		for (const regex of [this.SKETCHFAB_URL_REGEX_1, this.SKETCHFAB_URL_REGEX_2]) {
			const urlMatches = regex.exec(this.formModel.sketchfab_id.trim());
			if (urlMatches !== null && urlMatches.length === 2) {
				const id = urlMatches[1];
				return id;
			}
		}
		return this.formModel.sketchfab_id;
	}

	get hasValidSketchfabModelId() {
		return (
			this.formModel.sketchfab_id &&
			this.formModel.sketchfab_id.match(this.SKETCHFAB_FIELD_REGEX)
		);
	}

	onInit() {
		this.setField('game_id', this.game.id);
		if (this.formModel.sketchfab_id) {
			this.setField(
				'sketchfab_id',
				'https://sketchfab.com/models/' + this.formModel.sketchfab_id
			);
		}
	}

	onSubmit() {
		this.setField('sketchfab_id', this.sketchfabId);
		return this.formModel.$save();
	}
}
