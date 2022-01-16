<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';

class Wrapper extends BaseForm<GameScreenshot> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameImage extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameScreenshot;

	@Prop(Object) game!: Game;

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
	<app-form :controller="form">
		<app-form-group
			v-if="method === 'add'"
			name="file"
			:label="$gettext(`dash.games.media.image.form.image_label`)"
			:hide-label="true"
		>
			<p class="help-block" v-translate>
				<translate>Your image must be a PNG or JPG.</translate>
				<br />
				<strong>
					<translate>
						PNGs are highly recommended as they produce a lossless image.
					</translate>
				</strong>
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				:multiple="true"
				@changed="imagesSelected()"
			/>

			<app-form-control-errors :label="$gettext(`selection of images`)" />
		</app-form-group>

		<app-form-group
			v-if="method !== 'add'"
			name="caption"
			:label="$gettext(`dash.games.media.image.form.caption_label`)"
			:optional="true"
		>
			<app-form-control type="text" :validators="[validateMaxLength(200)]" />
			<app-form-control-errors />
			<p class="help-block">
				<translate>dash.games.media.image.form.caption_help</translate>
			</p>
		</app-form-group>

		<app-form-button v-if="method !== 'add'" show-when-valid>
			<translate v-if="method === 'add'">Add</translate>
			<translate v-else-if="method === 'edit'">Save</translate>
		</app-form-button>
	</app-form>
</template>
