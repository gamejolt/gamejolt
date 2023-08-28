<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';
import { GameScreenshotModel } from '../../../../../_common/game/screenshot/screenshot.model';

class Wrapper extends BaseForm<GameScreenshotModel> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameImage extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameScreenshotModel;

	@Prop(Object) game!: GameModel;

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/developer/games/media/save/image/${this.game.id}`;
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	imagesSelected() {
		// When images are selected, submit the form immediately.
		this.form.submit();
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			v-if="method === 'add'"
			name="file"
			:label="$gettext(`Image File`)"
			:hide-label="true"
		>
			<p class="help-block" v-translate>
				<AppTranslate>Your image must be a PNG or JPG.</AppTranslate>
				<br />
				<strong>
					<AppTranslate>
						PNGs are highly recommended as they produce a lossless image.
					</AppTranslate>
				</strong>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				:multiple="true"
				@changed="imagesSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`selection of images`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="method !== 'add'"
			name="caption"
			:label="$gettext(`Caption`)"
			:optional="true"
		>
			<AppFormControl type="text" :validators="[validateMaxLength(200)]" />
			<AppFormControlErrors />
			<p class="help-block">
				<AppTranslate
					>This caption will appear when your image is viewed in full
					screen.</AppTranslate
				>
			</p>
		</AppFormGroup>

		<AppFormButton v-if="method !== 'add'" show-when-valid>
			<AppTranslate v-if="method === 'add'">Add</AppTranslate>
			<AppTranslate v-else-if="method === 'edit'">Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
