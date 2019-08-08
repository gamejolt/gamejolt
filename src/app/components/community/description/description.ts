import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormCommunityDescription from '../../forms/community/description/description.vue';

@Component({
	components: {
		AppContentViewer,
		AppFadeCollapse,
		FormCommunityDescription,
	},
})
export default class AppCommunityDescription extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	isEditing!: boolean;

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
