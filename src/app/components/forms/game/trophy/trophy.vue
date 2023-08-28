<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';
import { GameTrophy } from '../../../../../_common/game/trophy/trophy.model';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

class Wrapper extends BaseForm<GameTrophy> {}

@Options({
	components: {
		AppImgResponsive,
		AppFormControlToggle,
		AppFormControlUpload,
	},
})
export default class FormGameTrophy extends mixins(Wrapper) implements FormOnLoad {
	@Prop(Object) game!: GameModel;
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
				label: this.$gettext('Bronze'),
				value: GameTrophy.DIFFICULTY_BRONZE,
			},
			{
				label: this.$gettext('Silver'),
				value: GameTrophy.DIFFICULTY_SILVER,
			},
			{
				label: this.$gettext('Gold'),
				value: GameTrophy.DIFFICULTY_GOLD,
			},
			{
				label: this.$gettext('Platinum'),
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
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to clear this trophy image?')
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
	<AppForm :controller="form">
		<!--
			Show the current image if there is one.
		-->
		<div v-if="formModel.has_thumbnail" class="form-group">
			<label class="control-label">
				<AppTranslate>Current Trophy Image</AppTranslate>
			</label>

			<AppImgResponsive
				:src="formModel.img_thumbnail"
				:alt="$gettext('Current Trophy Image')"
			/>

			<br />

			<div class="clearfix">
				<AppButton @click="clearImage">
					<AppTranslate>Clear Image</AppTranslate>
				</AppButton>
			</div>
		</div>

		<!-- TODO(vue3) translate-comment="Refers to a difficulty level. How easy/hard it is to accomplish." -->
		<AppFormGroup v-if="method === 'edit'" name="difficulty" :label="$gettext(`Difficulty`)">
			<AppFormControlSelect>
				<option v-for="item of difficultyOptions" :key="item.label" :value="item.value">
					{{ item.label }}
				</option>
			</AppFormControlSelect>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="file"
			:label="
				!formModel.has_thumbnail
					? $gettext('Trophy Image')
					: $gettext('Change Trophy Image')
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
					<AppTranslate>Learn more about trophy images...</AppTranslate>
				</a>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
			/>

			<AppFormControlErrors :label="$gettext(`trophy image`)" />
		</AppFormGroup>

		<AppFormGroup name="title" :label="$gettext(`Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Description`)">
			<AppFormControlTextarea rows="3" :validators="[validateMaxLength(1500)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="secret" :label="$gettext(`Secret`)">
			<p class="help-block">
				<AppTranslate>
					Secret trophies hide everything but their titles from players until they are
					achieved.
				</AppTranslate>
			</p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormGroup name="visible" :label="$gettext(`Visible`)">
			<p class="help-block">
				<AppTranslate>
					Hidden trophies are invisible to everyone but the game's developer, for testing
					and other nefarious reasons.
				</AppTranslate>
			</p>
			<AppFormControlToggle />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Trophy</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
