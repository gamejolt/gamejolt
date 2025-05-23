<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
	getCommentStore,
	useCommentStoreManager,
} from '../../../../../_common/comment/comment-store';
import { formatNumber } from '../../../../../_common/filters/number';
import AppGameModLinks from '../../../../../_common/game/mod-links/AppGameModLinks.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { showReportModal } from '../../../../../_common/report/modal/modal.service';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { getAbsoluteLink } from '../../../../../utils/router';
import { showCommentModal } from '../../../../components/comment/modal/modal.service';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { useGameRouteController } from './RouteDiscoverGamesView.vue';

const { game, trophiesCount, hasScores, primaryScoreTable } = useGameRouteController()!;
const { user: globalUser } = useCommonStore();
const commentManager = useCommentStoreManager()!;
const router = useRouter();

const hasAnyPerms = computed(() => Boolean(game.value?.hasPerms()));
const shouldShowModTools = computed(() => Boolean(globalUser.value?.isMod));

const commentsCount = computed(() => {
	if (game.value) {
		const store = getCommentStore(commentManager, 'Game', game.value.id);
		return store ? store.totalCount : 0;
	}
	return 0;
});

function showComments() {
	showCommentModal({ model: game.value!, displayMode: 'comments' });
}

function copyShareUrl() {
	if (!game.value) {
		return undefined;
	}

	const url = getAbsoluteLink(router, game.value.routeLocation);
	copyShareLink(url, 'game');
}

function report() {
	showReportModal(game.value!);
}
</script>

<template>
	<div>
		<nav class="platform-list inline">
			<ul>
				<li>
					<RouterLink
						:to="{ name: 'discover.games.view.overview' }"
						:class="{ active: $route.name === 'discover.games.view.overview' }"
					>
						<AppTranslate>Overview</AppTranslate>
					</RouterLink>
				</li>

				<li v-if="game?.comments_enabled">
					<a @click="showComments()">
						<AppTranslate>Comments</AppTranslate>
						<span v-if="commentsCount" class="badge">
							{{ formatNumber(commentsCount) }}
						</span>
					</a>
				</li>

				<li>
					<RouterLink
						:to="{ name: 'discover.games.view.followers' }"
						active-class="active"
					>
						<AppTranslate>Followers</AppTranslate>
						<span v-if="game" class="badge">
							{{ formatNumber(game.follower_count) }}
						</span>
					</RouterLink>
				</li>

				<li v-if="hasScores && primaryScoreTable">
					<RouterLink
						:to="{
							name: 'discover.games.view.scores.list',
							params: {
								type: 'best',
								tableId: primaryScoreTable.id,
							},
						}"
						:class="{ active: $route.name === 'discover.games.view.scores.list' }"
					>
						<AppTranslate>Scores</AppTranslate>
					</RouterLink>
				</li>

				<li v-if="trophiesCount">
					<RouterLink
						:to="{ name: 'discover.games.view.trophies.list' }"
						active-class="active"
					>
						<AppTranslate>Trophies</AppTranslate>
						<span class="badge">{{ formatNumber(trophiesCount) }}</span>
					</RouterLink>
				</li>

				<li>
					<AppPopper popover-class="fill-darkest">
						<a>
							<AppJolticon icon="ellipsis-v" />
						</a>

						<template #popover>
							<div v-if="game" class="list-group list-group-dark">
								<a class="list-group-item has-icon" @click="copyShareUrl">
									<AppJolticon icon="link" />
									<AppTranslate>Copy link to game</AppTranslate>
								</a>
								<AppGamePerms :game="game">
									<RouterLink
										class="list-group-item has-icon"
										:to="{
											name: 'dash.games.manage.game.overview',
											params: { id: game.id },
										}"
									>
										<AppJolticon icon="cog" />
										<AppTranslate>Manage game</AppTranslate>
									</RouterLink>
								</AppGamePerms>
								<a
									v-if="globalUser && !hasAnyPerms"
									class="list-group-item has-icon"
									@click="report"
								>
									<AppJolticon icon="flag" />
									<AppTranslate>Report game</AppTranslate>
								</a>
								<AppGameModLinks v-if="shouldShowModTools" :game="game" />
							</div>
						</template>
					</AppPopper>
				</li>
			</ul>
		</nav>
	</div>
</template>
