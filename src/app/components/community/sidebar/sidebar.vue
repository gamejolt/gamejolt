<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { formatNumber } from '../../../../_common/filters/number';
import { ReportModal } from '../../../../_common/report/modal/modal.service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserCreatorBadge from '../../../../_common/user/creator/AppUserCreatorBadge.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/AppUserAvatarList.vue';
import { User } from '../../../../_common/user/user.model';
import AppGameList from '../../game/list/list.vue';
import AppCommunityDescription from '../description/description.vue';
import { CommunitySidebarData } from './sidebar-data';

const GAME_LIST_COLLAPSED_COUNT = 3;

@Options({
	components: {
		AppCommunityDescription,
		AppUserAvatarList,
		AppUserCardHover,
		AppTimeAgo,
		AppGameList,
		AppShareCard,
		AppUserCreatorBadge,
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
</script>

<template>
	<div>
		<div v-if="shouldShowKnownMembers">
			<h5 class="section-header">
				<AppTranslate
					:translate-n="sidebarData.knownMemberCount"
					:translate-params="{ count: membersYouKnowCount }"
					translate-plural="%{ count } members you know"
				>
					1 member you know
				</AppTranslate>
			</h5>
			<AppUserAvatarList :users="sidebarData.knownMembers" />
			<br />
		</div>

		<AppCommunityDescription
			:key="community.id"
			:community="community"
			:is-editing="isEditing"
		/>

		<div v-if="shouldShowGames" class="-game-list">
			<div class="clearfix">
				<div v-if="hasMoreGames" class="pull-right">
					<AppButton trans @click="toggleGamesList">
						<AppTranslate v-if="gameListCollapsed"> View All </AppTranslate>
						<AppTranslate v-else> Show fewer </AppTranslate>
					</AppButton>
				</div>

				<h5 class="section-header">
					<AppTranslate>Games</AppTranslate>
				</h5>
			</div>
			<AppGameList :games="visibleGames" event-label="community-sidebar" />
		</div>

		<div class="-mod-list">
			<div class="clearfix">
				<div v-if="hasMoreCollaborators" class="pull-right">
					<AppButton
						trans
						:disabled="isLoadingMoreCollaborators"
						@click="toggleCollaboratorList"
					>
						<AppTranslate
							v-if="collaboratorListCollapsed || isLoadingMoreCollaborators"
						>
							View All
						</AppTranslate>
						<AppTranslate v-else>Show fewer</AppTranslate>
					</AppButton>
				</div>

				<h5 class="section-header">
					<AppTranslate>Collaborators</AppTranslate>
				</h5>
			</div>

			<div v-for="user of moderators" :key="user.id" class="-mod-list-entry">
				<AppUserCardHover :user="user">
					<router-link :to="user.url">
						<span>
							@{{ user.username }}
							<span class="-mod-avatar-container">
								<img
									:src="user.img_avatar"
									class="img-responsive -mod-avatar-img"
									alt=""
								/>

								<AppUserCreatorBadge
									v-if="user.is_creator"
									class="-mod-creator"
									small
								/>
								<AppJolticon
									v-else-if="user.is_verified"
									class="-mod-verified"
									icon="verified"
								/>
							</span>
						</span>
					</router-link>
				</AppUserCardHover>
				<span v-if="sidebarData.owner && user.id === sidebarData.owner.id" class="badge">
					<AppTranslate>owner</AppTranslate>
				</span>
			</div>
		</div>

		<div class="-community-end small">
			<AppShareCard resource="community" :url="shareUrl" bleed-padding />

			<div class="text-muted">
				<template v-if="shouldShowReport">
					<a @click="onClickReport">
						<AppTranslate>Report</AppTranslate>
					</a>
					<span class="dot-separator" />
				</template>
				A community for
				<AppTimeAgo :date="community.added_on" without-suffix />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-mod-list-entry
	margin-bottom: ($line-height-computed / 4)

	&> div
		display: inline-block !important

.-mod-avatar-container
	position: relative
	display: inline-block

.-mod-avatar-img
	display: inline
	height: 1.5em
	img-circle()

.-mod-creator
.-mod-verified
	position: absolute
	right: -4px
	bottom: -4px

.-mod-verified
	change-bg('bg-offset')
	border-radius: 100%
	font-size: 14px

.-game-list
	margin-top: $line-height-computed

.-mod-list
	margin-top: $line-height-computed

.-community-end
	margin-top: $line-height-computed * 1.5
</style>
