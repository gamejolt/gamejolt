import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import FormCommunityDescription from '../../forms/community/description/description.vue';

@Component({
	components: {
		AppContentViewer,
		AppFadeCollapse,
		FormCommunityDescription,
	},
})
export default class AppCommunityDescription extends Vue {
	@Prop({ type: Community, required: true }) community!: Community;
	@Prop({ type: Boolean, required: true }) isEditing!: boolean;

	canToggleDescription = false;
	isDescriptionOpen = false;

	get shouldShowEdit() {
		return this.isEditing && this.community.hasPerms('community-description');
	}

	toggleDescription() {
		this.isDescriptionOpen = !this.isDescriptionOpen;
	}

	canToggleDescriptionChanged(canToggle: boolean) {
		this.canToggleDescription = canToggle;
	}
}
