import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
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

	@Prop(Number)
	collaboratorCount!: number;

	@Prop(Number)
	initialCollaboratorCount!: number;

	@State
	app!: Store['app'];

	currentCollaborators: User[] = [];
	currentCollaboratorCount = 0;

	collaboratorListCollapsed = true;
	isLoadingMoreCollaborators = false;
	isShowingShare = false;
	loadedAll = false;

	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	@Emit('collaborators')
	emitCollaborators(_collaborators: User[]) {}

	@Watch('collaborators', { immediate: true })
	onCollaboratorsUpdated(collaborators: User[]) {
		this.currentCollaborators = collaborators;
	}

	@Watch('collaboratorCount', { immediate: true })
	onCollaboratorsCountUpdated(collaboratorCount: number) {
		this.currentCollaboratorCount = collaboratorCount;
	}

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

	get hasMoreCollaborators() {
		return this.currentCollaboratorCount > this.initialCollaboratorCount;
	}

	get moderators(): User[] {
		const mods = [];
		if (this.owner) {
			mods.push(this.owner);
		}
		if (this.currentCollaborators) {
			if (this.collaboratorListCollapsed) {
				mods.push(...this.currentCollaborators.slice(0, this.initialCollaboratorCount));
			} else {
				mods.push(...this.currentCollaborators);
			}
		}
		return mods;
	}

	copyShareUrl() {
		Clipboard.copy(this.shareUrl);
	}

	toggleCollaboratorList() {
		if (this.isLoadingMoreCollaborators) {
			return;
		}

		this.collaboratorListCollapsed = !this.collaboratorListCollapsed;

		if (!this.collaboratorListCollapsed) {
			this.loadAllCollaborators();
		}
	}

	async loadAllCollaborators() {
		if (this.loadedAll) {
			return;
		}

		this.isLoadingMoreCollaborators = true;

		const payload = await Api.sendRequest(
			`/web/communities/collaborators/${this.community.id}`
		);

		const collaborators = User.populate(payload.collaborators);
		this.currentCollaborators = collaborators;
		this.currentCollaboratorCount = collaborators.length;
		this.emitCollaborators(collaborators);

		this.isLoadingMoreCollaborators = false;
	}
}
