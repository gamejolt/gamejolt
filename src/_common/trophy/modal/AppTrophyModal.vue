<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { Screen } from '~common/screen/screen-service';
import { SiteTrophyModel } from '~common/site/trophy/trophy.model';
import { useCommonStore } from '~common/store/common-store';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import AppTrophyThumbnail from '~common/trophy/thumbnail/AppTrophyThumbnail.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import { UserGameTrophyModel } from '~common/user/trophy/game-trophy.model';
import {
	$viewUserBaseTrophyModel,
	UserBaseTrophyModel,
} from '~common/user/trophy/user-base-trophy.model';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';
import AppUserAvatarList from '~common/user/user-avatar/AppUserAvatarList.vue';

type Props = {
	userTrophy: UserBaseTrophyModel;
};
const { userTrophy } = defineProps<Props>();
const { user } = useCommonStore();
const modal = useModal()!;

const completionPercentage = ref<number | null>(null);
const friends = ref<UserModel[]>([]);

const trophy = computed(() => userTrophy.trophy!);

const bgClass = computed(() => '-trophy-difficulty-' + trophy.value.difficulty);

const canReceiveExp = computed(() =>
	!userTrophy.trophy ? false : !userTrophy.trophy.is_owner
);

const completionPercentageForDisplay = computed(() => {
	if (completionPercentage.value) {
		if (completionPercentage.value <= 1) {
			return 1;
		} else {
			return Math.round(completionPercentage.value);
		}
	}

	return undefined;
});

const shouldShowFriends = computed(() => Boolean(friends.value && friends.value.length > 0));

const game = computed(() =>
	userTrophy instanceof UserGameTrophyModel && userTrophy.game
		? userTrophy.game
		: undefined
);

const isGame = computed(() => !!game.value);

const loggedInUserUnlocked = computed(() =>
	Boolean(user.value && userTrophy.user_id === user.value.id)
);

const artist = computed(() =>
	trophy.value instanceof SiteTrophyModel && trophy.value.artist instanceof UserModel
		? trophy.value.artist
		: undefined
);

onMounted(() => {
	if (isGame.value) {
		populatePercentage();
	}
	if (user.value) {
		populateFriends();

		if (userTrophy.user_id === user.value.id && !userTrophy.viewed_on) {
			$viewUserBaseTrophyModel(userTrophy);
		}
	}
});

async function populatePercentage() {
	const payload = await Api.sendRequest(
		`/web/profile/trophies/game-trophy-percentage/${trophy.value.id}`,
		undefined,
		{ detach: true }
	);
	if (payload.percentage) {
		completionPercentage.value = payload.percentage;
	}
}

async function populateFriends() {
	const type = isGame.value ? 'game' : 'site';
	const payload = await Api.sendRequest(
		`/web/profile/trophies/friends/${type}/${trophy.value.id}`
	);
	if (payload.users) {
		friends.value = UserModel.populate(payload.users);
	}
}
</script>

<template>
	<AppModal>
		<div class="-content">
			<div class="-background">
				<div class="-bg" :class="bgClass" />
				<div class="-bg-gradient" />
			</div>
			<div class="-content-inner">
				<div class="modal-controls">
					<AppButton @click="modal.dismiss()">
						{{ $gettext('Close') }}
					</AppButton>
				</div>

				<div class="modal-header">
					<h2 class="modal-title -title">
						{{ trophy.title }}
					</h2>
					<div class="-subtitle small text-muted">
						<template v-if="game">
							<RouterLink
								v-app-tooltip="game.title"
								:to="game.routeLocation"
								class="-subtitle-link link-unstyled"
							>
								<AppJolticon icon="gamepad" />
								<AppTranslate :translate-params="{ title: game.title }">
									Game Trophy of %{ title }
								</AppTranslate>
							</RouterLink>
						</template>
						<template v-else>
							<AppJolticon icon="gamejolt" />
							<span>Game Jolt Trophy</span>
							<RouterLink
								v-if="artist"
								:to="artist.url"
								class="-subtitle-link link-unstyled"
							>
								<span class="dot-separator" />
								<AppUserCardHover :user="artist">
									<AppTranslate :translate-params="{ username: artist.username }">
										Art by @%{ username }
									</AppTranslate>
									<span class="-subtitle-avatar">
										<AppUserAvatarImg :user="artist" />
									</span>
								</AppUserCardHover>
							</RouterLink>
						</template>
					</div>
				</div>

				<div class="modal-body">
					<div class="-trophy-view">
						<div class="-thumbnail">
							<AppTrophyThumbnail
								:trophy="trophy"
								no-tooltip
								:no-highlight="loggedInUserUnlocked"
							/>
							<div v-if="canReceiveExp" class="-exp text-muted">
								<AppJolticon icon="exp" />
								<span v-translate="{ exp: trophy.experience }"> %{ exp } EXP </span>
							</div>
						</div>
						<div class="-info">
							<span class="text-muted small">
								Achieved
								<AppTimeAgo :date="userTrophy.logged_on" />
							</span>

							<span v-if="completionPercentageForDisplay" class="text-muted small">
								<span v-if="Screen.isDesktop" class="dot-separator small" />
								<br v-else />
								<span v-if="completionPercentageForDisplay === 1">
									{{ $gettext(`<1% of players achieved this trophy`) }}
								</span>
								<span v-else-if="completionPercentageForDisplay === 100">
									{{ $gettext(`100% of players achieved this trophy`) }}
								</span>
								<span v-else>
									{{
										$gettext(`~%{ num }% of players achieved this trophy`, {
											num: completionPercentageForDisplay,
										})
									}}
								</span>
							</span>

							<div class="-description well fill-offset">
								{{ trophy.description }}
							</div>

							<div v-if="shouldShowFriends" class="small">
								<div>
									{{ $gettext(`Friends who achieved this trophy`) }}
								</div>

								<AppUserAvatarList :users="friends" sm />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-content
	position: relative
	overflow: hidden

	@media $media-sm-up
		rounded-corners-lg()

.-background
	display: flex
	justify-content: center
	align-items: center

.-title
	margin-bottom: 2px

.-bg
	position: absolute
	width: 200%
	height: 200%
	min-height: 500px
	z-index: 1
	transform: rotateZ(30deg)
	background-image: url('../pattern.png')

.-trophy-difficulty-1
	background-color: rgba(248, 198, 143, 0.3)

.-trophy-difficulty-2
	background-color: rgba(207, 207, 207, 0.3)

.-trophy-difficulty-3
	background-color: rgba(255, 207, 39, 0.3)

.-trophy-difficulty-4
	background-color: rgba(176, 205, 217, 0.3)

.-bg-gradient
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 2
	background: linear-gradient(transparent 0%, var(--theme-bg-actual) 50%)

.-content-inner
	position: relative
	z-index: 3

.-trophy-view
	display: flex

	@media $media-xs
		flex-direction: column

.-thumbnail
	flex-shrink: 0

	@media $media-xs
		margin-bottom: $line-height-computed
		display: flex

	& > *
		width: 100px

.-trophy-type
	display: inline-block

	& > *
		vertical-align: middle

.-subtitle-link
	&:hover
		text-decoration: none

	& *
		vertical-align: middle

	// Override user hover card display block
	& > div
		display: inline-block !important

.-info
	@media $media-sm-up
		margin-left: 20px
		flex-grow: 1

.-description
	margin-top: ($line-height-computed / 2)
	word-break: break-word
	margin-bottom: ($line-height-computed / 2)

.-exp
	display: flex
	justify-content: center
	align-items: center
	margin-top: 10px

.-subtitle-avatar
	width: $line-height-computed
	height: $line-height-computed
	display: inline-block

	& > span
		display: inline-block
</style>
