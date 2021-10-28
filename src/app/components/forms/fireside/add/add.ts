import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import AppFormsCommunityPillAdd from '../../community/_pill/add/add.vue';
import AppFormsCommunityPill from '../../community/_pill/community-pill.vue';

export type FormModel = {
	title: string;
	is_draft: boolean;
	community_id: number | null;
	auto_feature: boolean;
	add_community_as_cohosts: boolean;
};

@Component({
	components: {
		AppFormsCommunityPillAdd,
		AppFormsCommunityPill,
		AppFormControlToggle,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class FormFiresideAdd extends BaseForm<FormModel> implements FormOnInit {
	@Prop(propRequired(Array)) communities!: Community[];
	@Prop({ type: String, required: false, default: undefined }) defaultTitle!: string;
	@Prop(propOptional(Community, null)) community!: Community | null;

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

	get showAdvancedCommunityOptions() {
		// DISABLED_ALLOW_FIRESIDES
		// Currently, we never show these options and default them to true when processing the form.
		return false;
		const community = this.selectedCommunity;
		if (!community) {
			return false;
		}

		return community.hasPerms('community-firesides');
	}

	onInit() {
		this.setField('is_draft', false);

		if (this.community) {
			this.setCommunity(this.community);
		} else {
			this.setField('community_id', null);
			this.setField('auto_feature', false);
			this.setField('add_community_as_cohosts', false);
		}
	}

	private setCommunity(community: Community) {
		this.setField('community_id', community.id);

		// Community mods that have this option probably want to have it enabled
		// by default.
		const isCollaborator = this.showAdvancedCommunityOptions;
		this.setField('auto_feature', isCollaborator);
		this.setField('add_community_as_cohosts', isCollaborator);
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
