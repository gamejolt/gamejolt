import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { formatNumber } from '../../../../_common/filters/number';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
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
		AppTimeAgo,
		AppGameList,
		AppShareCard,
	},
})
export default class AppCommunitySidebar extends Vue {
	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Object)
	community!: Community;

	@Prop(Object)
	sidebarData!: CommunitySidebarData;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	currentCollaborators: User[] = [];
	currentCollaboratorCount = 0;

	collaboratorListCollapsed = true;
	isLoadingMoreCollaborators = false;
	loadedAllCollaborators = false;
	isShowingShare = false;
	gameListCollapsed = true;

	@Watch('sidebarData.collaborators', { immediate: true, deep: true })
	onCollaboratorsUpdated(collaborators: User[]) {
		this.currentCollaborators = collaborators;
	}

	@Watch('sidebarData.collaboratorCount', { immediate: true })
	onCollaboratorsCountUpdated(collaboratorCount: number) {
		this.currentCollaboratorCount = collaboratorCount;
	}

	get shouldShowKnownMembers() {
		return (
			!!this.app.user &&
			this.sidebarData.knownMembers &&
			this.sidebarData.knownMembers.length > 0
		);
	}

	get membersYouKnowCount() {
		return formatNumber(this.sidebarData.knownMemberCount);
	}

	get shareUrl() {
		return getAbsoluteLink(this.$router, this.community.routeLocation);
	}

	get shareContent() {
		return this.$gettextInterpolate('Check out %{ name } community - Game Jolt', {
			name: this.community.name,
		});
	}

	get hasMoreCollaborators() {
		return this.currentCollaboratorCount > this.sidebarData.initialCollaboratorCount;
	}

	get moderators(): User[] {
		const mods = [];
		if (this.sidebarData.owner) {
			mods.push(this.sidebarData.owner);
		}
		if (this.currentCollaborators) {
			if (this.collaboratorListCollapsed) {
				mods.push(
					...this.currentCollaborators.slice(0, this.sidebarData.initialCollaboratorCount)
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

	get shouldShowReport() {
		return !this.community.hasPerms();
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

	onClickReport() {
		ReportModal.show(this.community);
	}
}
