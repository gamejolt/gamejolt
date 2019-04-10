import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue'
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarItem extends Vue {
	@Prop(Community)
	community!: Community;

	get isUnread() {
		return this.community.is_unread;
	}

	get isActive() {
		return (
			this.$route.name &&
			this.$route.name.indexOf('communities.view') === 0 &&
			this.$route.params.path === this.community!.path
		);
	}

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}
}
