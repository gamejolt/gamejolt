<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import AppSketchfabEmbed, {
	getSketchfabIdFromInput,
	SKETCHFAB_FIELD_VALIDATION_REGEX,
} from '../../../../../_common/sketchfab/embed/embed.vue';

class Wrapper extends BaseForm<GameSketchfab> {}

@Options({
	components: {
		AppSketchfabEmbed,
	},
})
export default class FormGameSketchfab extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object) game!: Game;

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
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="sketchfab_id" :label="$gettext(`Sketchfab Model URL`)">
			<p class="help-block">
				<translate>Enter your Sketchfab model's URL or ID. For example:</translate>
				<br />
				<code> https://sketchfab.com/3d-models/your-model-name-ID </code>
			</p>
			<app-form-control type="text" :validators="[validatePattern(SKETCHFAB_FIELD_REGEX)]" />
			<app-form-control-errors />
			<div v-if="hasValidSketchfabModelId">
				<br />
				<app-sketchfab-embed :sketchfab-id="sketchfabId" />
			</div>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Add</translate>
			<translate v-else-if="method === 'edit'">Save</translate>
		</app-form-button>
	</app-form>
</template>
