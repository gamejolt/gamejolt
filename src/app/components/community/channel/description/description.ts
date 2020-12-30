import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';

@Component({
	components: {
		AppContentViewer,
		AppFadeCollapse,
	},
})
export default class AppCommunityChannelDescription extends Vue {
	@Prop(propRequired(CommunityChannel)) channel!: CommunityChannel;

	canToggleDescription = false;
	isDescriptionOpen = false;

	toggleDescription() {
		this.isDescriptionOpen = !this.isDescriptionOpen;
	}

	canToggleDescriptionChanged(canToggle: boolean) {
		this.canToggleDescription = canToggle;
	}
}
