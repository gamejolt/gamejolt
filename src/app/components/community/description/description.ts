import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Community } from '../../../../_common/community/community.model';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';

@Options({
	components: {
		AppContentViewer,
		AppFadeCollapse,
	},
})
export default class AppCommunityDescription extends Vue {
	@Prop(propRequired(Community)) community!: Community;

	canToggleDescription = false;
	isDescriptionOpen = false;

	toggleDescription() {
		this.isDescriptionOpen = !this.isDescriptionOpen;
	}

	canToggleDescriptionChanged(canToggle: boolean) {
		this.canToggleDescription = canToggle;
	}
}
