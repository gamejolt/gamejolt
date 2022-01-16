<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
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
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Array, required: true }) channels!: CommunityChannel[];

	modelClass = CommunityChannel;

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
	<app-form :controller="form">
		<div>
			<app-form-community-channel-title :community="community" hide-label />
		</div>

		<app-form-button :disabled="!isValid">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
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
