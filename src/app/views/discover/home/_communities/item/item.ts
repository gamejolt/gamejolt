import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppMediaItemBackdrop from '../../../../../../_common/media-item/backdrop/backdrop.vue';

@Component({
	components: {
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppDiscoverHomeCommunitiesItem extends Vue {
	@Prop(propRequired(Community)) community!: Community;
}
