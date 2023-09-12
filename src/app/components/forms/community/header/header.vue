<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import {
	$clearCommunityHeader,
	$saveCommunityHeader,
	CommunityModel,
} from '../../../../../_common/community/community.model';
import AppFormControlCrop from '../../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';

type FormModel = CommunityModel & {
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
	modelClass = CommunityModel as any;
	modelSaveHandler = $saveCommunityHeader;

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
		if (this.modelSaveHandler === $saveCommunityHeader) {
			// Backend expects this field.
			this.setField('crop' as any, this.formModel.header_crop);
		}
	}

	async clearHeader() {
		const result = await showModalConfirm(
			this.$gettext(`Are you sure you want to remove the community header?`)
		);

		if (result) {
			this.modelSaveHandler = $clearCommunityHeader;
			this.form.submit();
		}
	}

	headerSelected() {
		if (this.formModel.file) {
			this.modelSaveHandler = $saveCommunityHeader;
			this.form.submit();
		}
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Header`)"
			:optional="!!formModel.header"
		>
			<p class="help-block">
				<AppTranslate>
					Headers are the big, banner-like images that adorn the tops of pages. For your
					header to look its best on all devices, make sure anything important is located
					near the center of the image.
				</AppTranslate>
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
				<AppLinkHelp page="dev-page-headers" class="link-help">
					<AppTranslate>What are the header requirements and guidelines?</AppTranslate>
				</AppLinkHelp>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minWidth, height: minHeight }),
					validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
				]"
				accept=".png,.jpg,.jpeg,.webp"
				@changed="headerSelected()"
			/>

			<AppFormControlErrors :label="$gettext(`header`)" />
		</AppFormGroup>

		<AppFormGroup
			v-if="formModel.header && !formModel.file"
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="formModel.header.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<AppFormControlErrors :label="$gettext('crop')" />
			</div>
		</AppFormGroup>

		<template v-if="formModel.header">
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
			<AppButton trans @click="clearHeader()">
				<AppTranslate>Remove Header</AppTranslate>
			</AppButton>
		</template>
	</AppForm>
</template>
