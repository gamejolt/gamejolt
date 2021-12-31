import { Options, Prop } from 'vue-property-decorator';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import {
	getSketchfabIdFromInput,
	SKETCHFAB_FIELD_VALIDATION_REGEX,
} from '../../../../../_common/sketchfab/embed/embed';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/embed.vue';

@Options({
	components: {
		AppSketchfabEmbed,
	},
})
export default class FormGameSketchfab extends BaseForm<GameSketchfab> implements FormOnSubmit {
	@Prop(Game) game!: Game;

	readonly SKETCHFAB_FIELD_REGEX = SKETCHFAB_FIELD_VALIDATION_REGEX;

	modelClass = GameSketchfab;

	get sketchfabId() {
		return getSketchfabIdFromInput(this.formModel.sketchfab_id);
	}

	get hasValidSketchfabModelId() {
		return (
			this.formModel.sketchfab_id &&
			this.formModel.sketchfab_id.match(this.SKETCHFAB_FIELD_REGEX)
		);
	}

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
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
