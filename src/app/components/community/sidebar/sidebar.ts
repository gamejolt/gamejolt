import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
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
import AppGameList from '../../game/list/list.vue';
import AppCommunityDescription from '../description/description.vue';
import { CommunitySidebarData } from './sidebar-data';

const GAME_LIST_COLLAPSED_COUNT = 3;

@Options({
	components: {
		AppCommunityDescription,
		AppUserAvatarList,
		AppGameThumbnail,
		AppUserCardHover,
		AppPopper,
		AppSocialTwitterShare,
		AppSocialFacebookLike,
		AppTimeAgo,
		AppGameList,
	},
})
export default class AppCommunitySidebar extends Vue {
	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Community)
	community!: Community;

	@Prop(CommunitySidebarData)
	data!: CommunitySidebarData;

	@State
	app!: Store['app'];

	currentCollaborators: User[] = [];
	currentCollaboratorCount = 0;

	collaboratorListCollapsed = true;
	isLoadingMoreCollaborators = false;
	loadedAllCollaborators = false;
	isShowingShare = false;
	gameListCollapsed = true;

	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	@Watch('data.collaborators', { immediate: true })
	onCollaboratorsUpdated(collaborators: User[]) {
		this.currentCollaborators = collaborators;
	}

	@Watch('data.collaboratorCount', { immediate: true })
	onCollaboratorsCountUpdated(collaboratorCount: number) {
		this.currentCollaboratorCount = collaboratorCount;
	}

	get shouldShowKnownMembers() {
		return !!this.app.user && this.data.knownMembers && this.data.knownMembers.length > 0;
	}

	get membersYouKnowCount() {
		return number(this.data.knownMemberCount);
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
		return this.currentCollaboratorCount > this.data.initialCollaboratorCount;
	}

	get moderators(): User[] {
		const mods = [];
		if (this.data.owner) {
			mods.push(this.data.owner);
		}
		if (this.currentCollaborators) {
			if (this.collaboratorListCollapsed) {
				mods.push(
					...this.currentCollaborators.slice(0, this.data.initialCollaboratorCount)
				);
			} else {
				mods.push(...this.currentCollaborators);
			}
		}
		return mods;
	}

	get filteredGames() {
		// We only show visible games. Collaborators with the right permissions also get hidden games,
		// but to avoid confusion we don't show them in the sidebar. They do show when editing the community.
		return this.community.games?.filter(i => i.isVisible);
	}

	get shouldShowGames() {
		return this.filteredGames && this.filteredGames.length;
	}

	get hasMoreGames() {
		return this.filteredGames && this.filteredGames.length > GAME_LIST_COLLAPSED_COUNT;
	}

	get visibleGames() {
		if (!this.filteredGames) {
			return [];
		}

		if (this.gameListCollapsed) {
			return this.filteredGames.slice(0, GAME_LIST_COLLAPSED_COUNT);
		}

		return this.filteredGames;
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
		if (this.loadedAllCollaborators || this.isLoadingMoreCollaborators) {
			return;
		}

		this.isLoadingMoreCollaborators = true;

		const payload = await Api.sendRequest(
			`/web/communities/collaborators/${this.community.id}`
		);

		const collaborators = User.populate(payload.collaborators);
		this.currentCollaborators = collaborators;
		this.currentCollaboratorCount = collaborators.length;

		this.isLoadingMoreCollaborators = false;
		this.loadedAllCollaborators = true;
	}

	toggleGamesList() {
		this.gameListCollapsed = !this.gameListCollapsed;
	}
}
