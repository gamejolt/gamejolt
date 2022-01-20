<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import AppFormsCommunityPillAdd from '../../community/_pill/add/add.vue';
import AppFormsCommunityPill from '../../community/_pill/community-pill.vue';

export type FormModel = {
	title: string;
	is_draft: boolean;
	community_id: number | null;
	auto_feature: boolean;
	add_community_as_cohosts: boolean;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormsCommunityPillAdd,
		AppFormsCommunityPill,
		AppFormControlToggle,
	},
})
export default class FormFiresideAdd extends mixins(Wrapper) {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: String, default: undefined })
	defaultTitle?: string;

	@Prop({ type: Object, default: null })
	community!: Community | null;

	get canSelectCommunity() {
		return this.selectableCommunities.length > 0;
	}

	get selectableCommunities() {
		return this.communities.filter(c => !c.isBlocked);
	}

	get selectedCommunity() {
		if (!this.formModel.community_id) {
			return undefined;
		}
		return this.communities.find(c => c.id === this.formModel.community_id);
	}

	onInit() {
		this.setField('is_draft', false);
		this.setField('title', '');

		if (this.community) {
			this.setCommunity(this.community);
		} else {
			this.setField('community_id', null);
		}
	}

	onBlurTitle() {
		this.setField('title', this.formModel.title.trim());
	}

	private setCommunity(community: Community) {
		this.setField('community_id', community.id);
	}

	onDraftSubmit() {
		this.setField('is_draft', true);
	}

	onAddCommunity(community: Community) {
		this.setCommunity(community);
	}

	onRemoveCommunity() {
		this.setField('community_id', null);
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext(`Title`)">
			<app-form-control
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:placeholder="defaultTitle"
				focus
				@blur="onBlurTitle"
			/>
			<app-form-control-errors />
			<div class="help-block">
				<translate>Let everyone know what you're doing in this fireside.</translate>
			</div>
		</app-form-group>

		<template v-if="canSelectCommunity">
			<app-form-group name="community_id" :label="$gettext(`Start in a community?`)">
				<div class="help-block">
					<translate>
						You can start firesides in communities you collaborate on. If you do,
						community members will be notified and other collaborators can stream with
						you.
					</translate>
				</div>

				<app-forms-community-pill
					v-if="selectedCommunity"
					:community="selectedCommunity"
					:with-channel="false"
					@remove="onRemoveCommunity"
				/>
				<app-forms-community-pill-add
					v-else
					:communities="selectableCommunities"
					:with-channel="false"
					@add-community="onAddCommunity"
				/>
			</app-form-group>
		</template>

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>Let's go!</translate>
		</app-form-button>
		<app-form-button
			:solid="false"
			:primary="false"
			:disabled="!valid"
			trans
			@before-submit="onDraftSubmit()"
		>
			<translate>Start as draft</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
