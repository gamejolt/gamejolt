<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Watch } from 'vue-property-decorator';
import AppFormControlCrop from '../../../../_common/form-vue/controls/AppFormControlCrop.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../_common/form-vue/form.service';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $clearUserHeader, $saveUserHeader, UserModel } from '../../../../_common/user/user.model';

type FormModel = UserModel & {
	header_crop: any;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppFormControlCrop,
	},
})
export default class FormUserHeader
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
	modelClass = UserModel as any;
	modelSaveHandler = $saveUserHeader;

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/header/save`;
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
		const result = await showModalConfirm(
			this.$gettext(`Are you sure you want to remove your profile header?`)
		);

		if (result) {
			$clearUserHeader(this.formModel);
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
	<AppForm :controller="form">
		<AppFormGroup
			name="file"
			:label="$gettext(`Upload New Header`)"
			:optional="!!formModel.header_media_item"
		>
			<p class="help-block">
				<AppTranslate>
					Headers are the big, banner-like images that adorn the tops of pages. For your
					header to look its best on all devices, make sure anything important is located
					near the center of the image.
				</AppTranslate>
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
			name="header_crop"
			:label="$gettext(`Crop Current Header`)"
			v-if="formModel.header_media_item && !formModel.file"
		>
			<div class="form-control-static">
				<AppFormControlCrop
					:src="formModel.header_media_item.img_url"
					:min-width="minWidth"
					:min-height="minHeight"
					:max-width="maxWidth"
					:max-height="maxHeight"
					:min-aspect-ratio="minAspectRatio"
					:max-aspect-ratio="maxAspectRatio"
				/>

				<AppFormControlErrors />
			</div>
		</AppFormGroup>

		<template v-if="formModel.header_media_item">
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
			<AppButton trans @click="clearHeader()">
				<AppTranslate>Remove Header</AppTranslate>
			</AppButton>
		</template>
	</AppForm>
</template>
