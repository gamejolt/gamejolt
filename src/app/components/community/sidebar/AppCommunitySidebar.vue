<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import AppCommunityDescription from '~app/components/community/description/AppCommunityDescription.vue';
import { CommunitySidebarData } from '~app/components/community/sidebar/sidebar-data';
import AppGameList from '~app/components/game/list/AppGameList.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel } from '~common/community/community.model';
import { formatNumber } from '~common/filters/number';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { showReportModal } from '~common/report/modal/modal.service';
import AppShareCard from '~common/share/card/AppShareCard.vue';
import { useCommonStore } from '~common/store/common-store';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { $gettext } from '~common/translate/translate.service';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserCreatorBadge from '~common/user/creator/AppUserCreatorBadge.vue';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarList from '~common/user/user-avatar/AppUserAvatarList.vue';
import { getAbsoluteLink } from '~utils/router';

type Props = {
	community: CommunityModel;
	sidebarData: CommunitySidebarData;
};
const { community, sidebarData } = defineProps<Props>();
const { user } = useCommonStore();
const router = useRouter();

const GameListCollapsedCount = 3;

const currentCollaborators = ref<UserModel[]>([]);
const currentCollaboratorCount = ref(0);
const collaboratorListCollapsed = ref(true);
const isLoadingMoreCollaborators = ref(false);
const loadedAllCollaborators = ref(false);
const gameListCollapsed = ref(true);

watch(
	() => sidebarData.collaborators,
	collaborators => {
		currentCollaborators.value = collaborators;
	},
	{ immediate: true, deep: true }
);

watch(
	() => sidebarData.collaboratorCount,
	collaboratorCount => {
		currentCollaboratorCount.value = collaboratorCount;
	},
	{ immediate: true }
);

const shouldShowKnownMembers = computed(
	() => !!user.value && sidebarData.knownMembers && sidebarData.knownMembers.length > 0
);

const shareUrl = computed(() => getAbsoluteLink(router, community.routeLocation));

const hasMoreCollaborators = toRef(
	() => currentCollaboratorCount.value > sidebarData.initialCollaboratorCount
);

const moderators = computed<UserModel[]>(() => {
	const mods = [];
	if (sidebarData.owner) {
		mods.push(sidebarData.owner);
	}
	if (currentCollaborators.value) {
		if (collaboratorListCollapsed.value) {
			mods.push(...currentCollaborators.value.slice(0, sidebarData.initialCollaboratorCount));
		} else {
			mods.push(...currentCollaborators.value);
		}
	}
	return mods;
});

// We only show visible games. Collaborators with the right permissions also get hidden games,
// but to avoid confusion we don't show them in the sidebar. They do show when editing the community.
const filteredGames = computed(() => community.games?.filter(i => i.isVisible));

const shouldShowGames = toRef(() => filteredGames.value && filteredGames.value.length);

const hasMoreGames = toRef(
	() => filteredGames.value && filteredGames.value.length > GameListCollapsedCount
);

const visibleGames = computed(() => {
	if (!filteredGames.value) {
		return [];
	}

	if (gameListCollapsed.value) {
		return filteredGames.value.slice(0, GameListCollapsedCount);
	}

	return filteredGames.value;
});

const shouldShowReport = computed(() => !community.hasPerms());

function toggleCollaboratorList() {
	if (isLoadingMoreCollaborators.value) {
		return;
	}

	collaboratorListCollapsed.value = !collaboratorListCollapsed.value;

	if (!collaboratorListCollapsed.value) {
		loadAllCollaborators();
	}
}

async function loadAllCollaborators() {
	if (loadedAllCollaborators.value || isLoadingMoreCollaborators.value) {
		return;
	}

	isLoadingMoreCollaborators.value = true;

	const payload = await Api.sendRequest(`/web/communities/collaborators/${community.id}`);

	const collaborators = UserModel.populate(payload.collaborators);
	currentCollaborators.value = collaborators;
	currentCollaboratorCount.value = collaborators.length;

	isLoadingMoreCollaborators.value = false;
	loadedAllCollaborators.value = true;
}

function toggleGamesList() {
	gameListCollapsed.value = !gameListCollapsed.value;
}

function onClickReport() {
	showReportModal(community);
}
</script>

<template>
	<div>
		<div v-if="shouldShowKnownMembers">
			<h5 class="section-header">
				{{
					$ngettext(
						`1 member you know`,
						`%{ count } members you know`,
						sidebarData.knownMemberCount,
						{ count: formatNumber(sidebarData.knownMemberCount) }
					)
				}}
			</h5>
			<AppUserAvatarList :users="sidebarData.knownMembers" />
			<br />
		</div>

		<AppCommunityDescription :key="community.id" :community="community" />

		<div v-if="shouldShowGames" class="-game-list">
			<div class="clearfix">
				<div v-if="hasMoreGames" class="pull-right">
					<AppButton trans @click="toggleGamesList">
						<div v-if="gameListCollapsed">
							{{ $gettext(`View all`) }}
						</div>
						<div v-else>
							{{ $gettext(`Show fewer`) }}
						</div>
					</AppButton>
				</div>

				<h5 class="section-header">
					{{ $gettext(`Games`) }}
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
						<div v-if="collaboratorListCollapsed || isLoadingMoreCollaborators">
							{{ $gettext(`View all`) }}
						</div>
						<div v-else>
							{{ $gettext(`Show fewer`) }}
						</div>
					</AppButton>
				</div>

				<h5 class="section-header">
					{{ $gettext(`Collaborators`) }}
				</h5>
			</div>

			<div v-for="mod of moderators" :key="mod.id" class="-mod-list-entry">
				<AppUserCardHover :user="mod">
					<RouterLink :to="mod.url">
						<span>
							@{{ mod.username }}
							<span class="-mod-avatar-container">
								<img
									:src="mod.img_avatar"
									class="img-responsive -mod-avatar-img"
									alt=""
								/>

								<AppUserCreatorBadge
									v-if="mod.is_creator"
									class="-mod-creator"
									size="sm"
								/>
								<AppJolticon
									v-else-if="mod.is_verified"
									class="-mod-verified"
									icon="verified"
								/>
							</span>
						</span>
					</RouterLink>
				</AppUserCardHover>
				<span v-if="sidebarData.owner && mod.id === sidebarData.owner.id" class="badge">
					{{ $gettext(`owner`) }}
				</span>
			</div>
		</div>

		<div class="-community-end small">
			<AppShareCard resource="community" :url="shareUrl" bleed-padding />

			<div class="text-muted">
				<template v-if="shouldShowReport">
					<a @click="onClickReport">
						{{ $gettext(`Report`) }}
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
