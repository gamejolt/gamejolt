<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

type FormModel = Game & {
	header_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormGameHeader
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Game as any;
	saveMethod = '$saveHeader' as const;

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/developer/games/header/save/${this.model!.id}`;
	}

	get crop() {
		return this.formModel.header_media_item
			? this.formModel.header_media_item.getCrop()
			: undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('header_crop', this.crop);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minAspectRatio = payload.minAspectRatio;
		this.maxAspectRatio = payload.maxAspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
		this.minHeight = payload.minHeight;
		this.maxHeight = payload.maxHeight;
	}

	onBeforeSubmit() {
		// Backend expects this field.
		this.setField('crop' as any, this.formModel.header_crop);
	}

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your game header?`)
		);

		if (result) {
			const payload = await this.formModel.$clearHeader();
			// Overwrite the base model's header media item here.
			// This needs to be done because this form does not resolve (and may never resolve)
			// after cleaning a header. Need to ensure that the base model's header gets cleared.
			this.model?.assign(payload.game);
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.form.submit();
		}
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group
			name="file"
			:label="$gettext(`Upload New Header`)"
			:optional="!!formModel.header_media_item"
		>
			<p class="help-block">
				<translate>
					Headers are the big, banner-like images that adorn the tops of pages. For your
					header to look its best on all devices, make sure anything important is located
					near the center of the image.
				</translate>
			</p>
			<p class="help-block" v-translate>
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p class="help-block strong" v-translate="{ dimensions: '2000×500' }">
				The recommended size for a header image is
				<code>%{dimensions}</code>
				(ratio of 4 ÷ 1).
			</p>
			<p class="help-block">
				<app-link-help page="dev-page-headers" class="link-help">
					<translate>What are the header requirements and guidelines?</translate>
				</app-link-help>
			</p>

			<app-form-control-upload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minWidth, height: minHeight }),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="headerSelected()"
			/>

			<app-form-control-errors :label="$gettext(`header`)" />
		</app-form-group>

		<app-form-group
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
			v-if="formModel.header_media_item && !formModel.file"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.header_media_item.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<app-form-control-errors />
			</div>
		</app-form-group>

		<template v-if="formModel.header_media_item">
			<app-form-button>
				<translate>Save</translate>
			</app-form-button>
			<app-button trans @click="clearHeader()">
				<translate>Remove Header</translate>
			</app-button>
		</template>
	</app-form>
</template>
