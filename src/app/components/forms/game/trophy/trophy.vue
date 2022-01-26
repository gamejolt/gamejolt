<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameTrophy } from '../../../../../_common/game/trophy/trophy.model';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

class Wrapper extends BaseForm<GameTrophy> {}

@Options({
	components: {
		AppImgResponsive,
		AppFormControlToggle,
		AppFormControlUpload,
	},
})
export default class FormGameTrophy extends mixins(Wrapper) implements FormOnLoad {
	@Prop(Object) game!: Game;
	@Prop(Number) difficulty!: number;

	modelClass = GameTrophy;

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

	created() {
		this.form.resetOnSubmit = true;
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
</script>

<template>
	<app-form :controller="form">
		<!--
			Show the current image if there is one.
		-->
		<div v-if="formModel.has_thumbnail" class="form-group">
			<label class="control-label">
				<translate>Current Trophy Image</translate>
			</label>

			<app-img-responsive
				:src="formModel.img_thumbnail"
				:alt="$gettext('Current Trophy Image')"
			/>

			<br />

			<div class="clearfix">
				<app-button @click="clearImage">
					<translate>Clear Image</translate>
				</app-button>
			</div>
		</div>

		<!-- TODO(vue3) translate-comment="Refers to a difficulty level. How easy/hard it is to accomplish." -->
		<app-form-group v-if="method === 'edit'" name="difficulty" :label="$gettext(`Difficulty`)">
			<app-form-control-select>
				<option v-for="item of difficultyOptions" :key="item.label" :value="item.value">
					{{ item.label }}
				</option>
			</app-form-control-select>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="file"
			:label="
				!formModel.has_thumbnail
					? $gettext('dash.games.trophies.form.upload_label')
					: $gettext('dash.games.trophies.form.change_image_label')
			"
			:optional="true"
		>
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>

			<p class="help-block">
				<a class="link-help">
					<translate>dash.games.trophies.form.image_help_link</translate>
				</a>
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
			/>

			<app-form-control-errors
				:label="$gettext(`dash.games.trophies.form.image_error_label`)"
			/>
		</app-form-group>

		<app-form-group name="title" :label="$gettext(`dash.games.trophies.form.title_label`)">
			<app-form-control type="text" :validators="[validateMaxLength(150)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext(`dash.games.trophies.form.description_label`)"
		>
			<app-form-control-textarea rows="3" :validators="[validateMaxLength(1500)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="secret" :label="$gettext(`dash.games.trophies.form.secret_label`)">
			<p class="help-block">
				<translate>dash.games.trophies.form.secret_help</translate>
			</p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-group name="visible" :label="$gettext(`Visible`)">
			<p class="help-block">
				<translate>
					Hidden trophies are invisible to everyone but the game's developer, for testing
					and other nefarious reasons.
				</translate>
			</p>
			<app-form-control-toggle />
		</app-form-group>

		<app-form-button>
			<translate>dash.games.trophies.form.save_button</translate>
		</app-form-button>
	</app-form>
</template>
