<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import AppFormCommunityChannelTitle from '../_title/title.vue';

type FormModel = {
	title: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormCommunityChannelTitle,
	},
})
export default class FormCommunityChannelChangeUrl extends mixins(Wrapper) {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: Array, required: true }) channels!: CommunityChannelModel[];

	modelClass = CommunityChannelModel;

	get isValid() {
		if (!this.valid) {
			return false;
		}

		return (
			!!this.formModel.title &&
			this.formModel.title.trim().length >= 3 &&
			this.formModel.title.trim().length <= 30 &&
			!this.channels
				.map(i => i.title.toLowerCase().trim())
				.includes(this.formModel.title.toLowerCase().trim())
		);
	}

	created() {
		this.form.resetOnSubmit = true;
	}
}
</script>

<template>
	<AppForm :controller="form">
		<div>
			<AppFormCommunityChannelTitle :community="community" hide-label />
		</div>

		<AppFormButton :disabled="!isValid">
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-form
	display: flex
	align-items: flex-start

	&-input
		flex: auto

	button
		margin-left: 5px
</style>
