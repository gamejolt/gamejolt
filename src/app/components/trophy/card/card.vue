<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import { Game } from '../../../../_common/game/game.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import { TrophyModal } from '../modal/modal.service';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppTrophyThumbnail,
		AppFadeCollapse,
	},
})
export default class AppTrophyCard extends Vue {
	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get trophy() {
		return this.userTrophy.trophy!;
	}

	get isNew() {
		if (this.app.user) {
			return !this.userTrophy.viewed_on && this.userTrophy.user_id === this.app.user!.id;
		}
		return false;
	}

	get bgClass() {
		return '-trophy-difficulty-' + this.trophy.difficulty;
	}

	get isGame() {
		return this.userTrophy instanceof UserGameTrophy && !!this.userTrophy.game;
	}

	get gameTitle() {
		if (this.userTrophy instanceof UserGameTrophy && this.userTrophy.game instanceof Game) {
			return this.userTrophy.game.title;
		}
		return this.$gettext(`Game Trophy`);
	}

	get loggedInUserUnlocked() {
		return this.app.user && this.userTrophy.user_id === this.app.user.id;
	}

	onClick() {
		TrophyModal.show(this.userTrophy);
	}
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
				<div class="-bg" :class="bgClass"></div>
				<div class="-bg-gradient"></div>
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
								<AppTranslate>Game Jolt Trophy</AppTranslate>
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

<style lang="stylus" src="./card.styl" scoped></style>
