<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppFadeCollapse from '../AppFadeCollapse.vue';
import { GameModel } from '../game/game.model';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { useCommonStore } from '../store/common-store';
import { $gettext } from '../translate/translate.service';
import { UserGameTrophy } from '../user/trophy/game-trophy.model';
import { UserBaseTrophyModel } from '../user/trophy/user-base-trophy.model';
import { showTrophyModal } from './modal/modal.service';
import AppTrophyThumbnail from './thumbnail/AppTrophyThumbnail.vue';

const props = defineProps({
	userTrophy: {
		type: Object as PropType<UserBaseTrophyModel>,
		required: true,
	},
});

const { userTrophy } = toRefs(props);
const { user } = useCommonStore();

const trophy = computed(() => userTrophy.value.trophy!);

const isNew = computed(() => {
	if (user.value) {
		return !userTrophy.value.viewed_on && userTrophy.value.user_id === user.value.id;
	}
	return false;
});

const bgClass = computed(() => '-trophy-difficulty-' + trophy.value.difficulty);

const isGame = computed(
	() => userTrophy.value instanceof UserGameTrophy && !!userTrophy.value.game
);

const gameTitle = computed(() => {
	if (userTrophy.value instanceof UserGameTrophy && userTrophy.value.game instanceof GameModel) {
		return userTrophy.value.game.title;
	}
	return $gettext(`Game Trophy`);
});

const loggedInUserUnlocked = computed(() =>
	Boolean(user.value && userTrophy.value.user_id === user.value.id)
);

function onClick() {
	showTrophyModal(userTrophy.value);
}
</script>

<template>
	<div class="-container">
		<div
			class="-trophy-card sheet sheet-no-full-bleed"
			:class="{ '-trophy-new': isNew }"
			@click="onClick"
		>
			<div class="-background">
				<div class="-bg" :class="bgClass" />
				<div class="-bg-gradient" />
			</div>
			<div class="-content">
				<strong class="-title" :title="trophy.title">{{ trophy.title }}</strong>
				<div class="-subline">
					<small class="text-muted">
						<span v-if="isGame" class="-game-title">
							<AppJolticon icon="gamepad" />
							<span>
								{{ gameTitle }}
							</span>
						</span>
						<template v-else>
							<AppJolticon icon="gamejolt" />
							<span>
								{{ $gettext(`Game Jolt Trophy`) }}
							</span>
						</template>
					</small>
				</div>
				<div class="-thumbnail">
					<AppTrophyThumbnail
						:trophy="trophy"
						no-tooltip
						:no-highlight="loggedInUserUnlocked"
					/>
				</div>
				<div class="-description">
					<AppFadeCollapse :collapse-height="64">
						<small class="text-muted">{{ trophy.description }}</small>
					</AppFadeCollapse>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	position: relative

.-trophy-card
	elevate-1()
	height: 280px
	position: relative
	overflow: hidden
	cursor: pointer

	&:hover
		elevate-2()

.-trophy-new
	border-color: var(--theme-notice)

.-background
	display: flex
	justify-content: center
	align-items: center

.-bg
	position: absolute
	width: 200%
	height: 200%
	z-index: 1
	transform: rotateZ(30deg)
	background-image: url('./pattern.png')

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
	background: linear-gradient(transparent 0, var(--theme-bg-actual) 40%)

.-content
	position: relative
	z-index: 3

.-title
	width: 100%
	display: inline-block
	text-align: center
	text-overflow()

.-subline
	width: 100%
	text-align: center
	margin-bottom: 10px

	& *
		vertical-align: middle

.-thumbnail
	display: flex
	justify-content: center

	& > *
		width: 100px

.-description
	margin-top: 10px
	text-align: center
	word-break: break-word

.-game-title
	display: block
	text-overflow()
</style>
