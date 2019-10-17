import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Community } from '../../../../_common/community/community.model';
import { Environment } from '../../../../_common/environment/environment.service';
import { number } from '../../../../_common/filters/number';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppSocialFacebookLike } from '../../../../_common/social/facebook/like/like';
import { AppSocialTwitterShare } from '../../../../_common/social/twitter/share/share';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
import { Store } from '../../../store';
import AppCommunityDescription from '../description/description.vue';

@Component({
	components: {
		AppCommunityDescription,
		AppUserAvatarList,
		AppGameThumbnail,
		AppUserCardHover,
		AppPopper,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppTimeAgo,
	},
})
export default class AppCommunitySidebar extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(User)
	owner!: User;

	@Prop(Array)
	knownMembers!: User[];

	@Prop(Number)
	knownMemberCount!: number;

	@Prop(Array)
	collaborators!: User[];

	@Prop(Boolean)
	hasMoreCollaborators!: boolean;

	@Prop(Number)
	initialCollaboratorCount!: number;

	@State
	app!: Store['app'];

	collaboratorListCollapsed = false;
	isLoadingMoreCollaborators = false;
	isShowingShare = false;

	get shouldShowKnownMembers() {
		return !!this.app.user && this.knownMembers && this.knownMembers.length > 0;
	}

	get membersYouKnowCount() {
		return number(this.knownMemberCount);
	}

	get shareUrl() {
		return Environment.baseUrl + this.$router.resolve(this.community.routeLocation).href;
	}

	get shareContent() {
		return this.$gettextInterpolate('Check out %{ name } community - Game Jolt', {
			name: this.community.name,
		});
	}

	get shouldShowCollabSection() {
		return (
			this.owner instanceof User ||
			(this.collaborators !== null && this.collaborators.length > 0)
		);
	}

	get moderators(): User[] {
		const mods = [];
		if (this.owner) {
			mods.push(this.owner);
		}
		if (this.collaborators) {
			if (this.collaboratorListCollapsed) {
				mods.push(...this.collaborators.slice(0, this.initialCollaboratorCount));
			} else {
				mods.push(...this.collaborators);
			}
		}
		return mods;
	}

	get shouldShowLoadMoreCollaborators() {
		return (
			this.hasMoreCollaborators ||
			this.isLoadingMoreCollaborators ||
			(this.collaborators !== null &&
				this.collaborators.length > this.initialCollaboratorCount)
		);
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	toggleCollaboratorList() {
		if (this.hasMoreCollaborators) {
			this.loadMoreCollaborators();
		} else {
			this.collaboratorListCollapsed = !this.collaboratorListCollapsed;
		}
	}

	async loadMoreCollaborators() {
		this.isLoadingMoreCollaborators = true;
		const payload = await Api.sendRequest(
			`/web/communities/more-collaborators/${this.community.id}`
		);
		const collaborators = User.populate(payload.collaborators);
		if (this.collaborators) {
			this.collaborators.push(...collaborators);
		}
		this.isLoadingMoreCollaborators = false;
		this.collaboratorListCollapsed = false;
	}
}
