import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
})
export default class AppCommunityOverlayPill extends Vue {
	@Prop({ type: Community, required: true })
	community!: Community;
}
