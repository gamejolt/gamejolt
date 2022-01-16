<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

type FormModel = Community & {
	header_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormCommunityHeader
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	modelClass = Community as any;

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/communities/design/save_header/${this.model!.id}`;
	}

	get crop() {
		return this.formModel.header ? this.formModel.header.getCrop() : undefined;
	}

	@Watch('crop')
	onCropChange() {
		this.setField('header_crop', this.crop);
	}

	created() {
		this.form.saveMethod = '$saveHeader';
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
		if (this.form.saveMethod === '$saveHeader') {
			// Backend expects this field.
			this.setField('crop' as any, this.formModel.header_crop);
		}
	}

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove the community header?`)
		);

		if (result) {
			this.form.saveMethod = '$clearHeader';
			this.form.submit();
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.form.saveMethod = '$saveHeader';
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
			:optional="!!formModel.header"
		>
			<p class="help-block">
				<translate>
					Headers are the big, banner-like images that adorn the tops of pages. For your
					header to look its best on all devices, make sure anything important is located
					near the center of the image.
				</translate>
			</p>
			<p v-translate class="help-block">
				Your image must be a PNG or JPG.
				<br />
				<strong>PNGs are highly recommended as they produce a lossless image.</strong>
			</p>
			<p v-translate="{ dimensions: '2000×500' }" class="help-block strong">
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
			v-if="formModel.header && !formModel.file"
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
		>
			<div class="form-control-static">
				<app-form-control-crop
					:src="formModel.header.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<app-form-control-errors :label="$gettext('crop')" />
			</div>
		</app-form-group>

		<template v-if="formModel.header">
			<app-form-button>
				<translate>Save</translate>
			</app-form-button>
			<app-button trans @click="clearHeader()">
				<translate>Remove Header</translate>
			</app-button>
		</template>
	</app-form>
</template>
