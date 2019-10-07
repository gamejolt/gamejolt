import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppPill from '../../pill/pill.vue';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Component({
	components: {
		AppPill,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
})
export default class AppCommunityPill extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	static?: boolean;

	get to() {
		return this.static
			? undefined
			: {
					name: 'communities.view.overview',
					params: {
						path: this.community.path,
					},
			  };
	}
}
