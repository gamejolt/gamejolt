import View from '!view!./item.html?style=./item.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppCommunityThumbnailImg } from 'game-jolt-frontend-lib/components/community/thumbnail/img/img';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppCommunityThumbnailImg,
	},
})
export class AppCommunitySliderItem extends Vue {
	@Prop(Community)
	community!: Community;

	get gradient() {
		let begin = 'var(--theme-bi-bg)';
		let end = 'var(--theme-bi-fg)';

		if (this.community.theme) {
			begin = '#' + this.community.theme.biBg_;
			end = '#' + this.community.theme.biFg_;
		}

		return `linear-gradient(to bottom left, ${begin} 0, ${end} 100%)`;
	}
}
