import { mixins, Options, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
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
	directives: {
		AppFocusWhen,
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
