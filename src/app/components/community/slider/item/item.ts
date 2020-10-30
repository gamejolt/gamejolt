import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { Store } from '../../../../store/index';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppMediaItemBackdrop,
	},
})
export default class AppCommunitySliderItem extends Vue {
	@Prop({ type: Community, required: true }) community!: Community;
	@Prop({ type: String, required: false, default: 'global' }) eventCat!: string;

	@State
	communityStates!: Store['communityStates'];

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get isUnread() {
		return this.communityState.isUnread;
	}

	get gradient() {
		let begin = 'var(--theme-bi-bg)';
		let end = 'var(--theme-bi-fg)';

		if (this.community.theme) {
			begin = '#' + this.community.theme.biBg_;
			end = '#' + this.community.theme.biFg_;
		}

		return `linear-gradient(to bottom left, ${begin} 0, ${end} 100%)`;
	}

	get event() {
		return `${this.eventCat}:community-slider:${this.community.path}`;
	}
}
