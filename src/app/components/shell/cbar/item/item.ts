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
export class AppShellCbarItem extends Vue {
	@Prop(Community)
	community?: Community;

	get highlight() {
		const highlight = this.community && this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}
}
