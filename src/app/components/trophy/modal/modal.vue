<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Screen } from '../../../../_common/screen/screen-service';
import { SiteTrophy } from '../../../../_common/site/trophy/trophy.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppTrophyThumbnail,
		AppTimeAgo,
		AppUserAvatarList,
		AppUserAvatarImg,
		AppUserCardHover,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppTrophyModal extends mixins(BaseModal) {
	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	completionPercentage: number | null = null;
	friends: User[] | null = null;

	readonly Screen = Screen;

	get trophy() {
		return this.userTrophy.trophy!;
	}

	get bgClass() {
		return '-trophy-difficulty-' + this.trophy.difficulty;
	}

	get isGame() {
		return this.userTrophy instanceof UserGameTrophy && !!this.userTrophy.game;
	}

	get canReceiveExp() {
		if (!this.userTrophy.trophy) {
			return false;
		}

		return !this.userTrophy.trophy.is_owner;
	}

	get completionPercentageForDisplay() {
		if (this.completionPercentage) {
			if (this.completionPercentage <= 1) {
				return 1;
			}
			return Math.floor(this.completionPercentage);
		}
	}

	get shouldShowFriends() {
		return this.friends && this.friends.length > 0;
	}

	get game() {
		if (this.userTrophy instanceof UserGameTrophy) {
			return this.userTrophy.game;
		}
	}

	get loggedInUserUnlocked() {
		return this.app.user && this.userTrophy.user_id === this.app.user.id;
	}

	get artist() {
		if (this.trophy instanceof SiteTrophy && this.trophy.artist instanceof User) {
			return this.trophy.artist;
		}
	}

	mounted() {
		if (this.isGame) {
			this.populatePercentage();
		}
		if (this.app.user) {
			this.populateFriends();

			if (this.userTrophy.user_id === this.app.user.id && !this.userTrophy.viewed_on) {
				this.userTrophy.$view();
			}
		}
	}

	async populatePercentage() {
		const payload = await Api.sendRequest(
			`/web/profile/trophies/game-trophy-percentage/${this.trophy.id}`,
			undefined,
			{ detach: true }
		);
		if (payload.percentage) {
			this.completionPercentage = payload.percentage;
		}
	}

	async populateFriends() {
		const type = this.isGame ? 'game' : 'site';
		const payload = await Api.sendRequest(
			`/web/profile/trophies/friends/${type}/${this.trophy.id}`
		);
		if (payload.users) {
			this.friends = User.populate(payload.users);
		}
	}
}
</script>

<template>
	<AppModal>
		<div class="-content">
			<div class="-background">
				<div class="-bg" :class="bgClass"></div>
				<div class="-bg-gradient"></div>
			</div>
			<div class="-content-inner">
				<div class="modal-controls">
					<AppButton @click="modal.dismiss()">
						<AppTranslate>Close</AppTranslate>
					</AppButton>
				</div>

				<div class="modal-header">
					<h2 class="modal-title -title">
						{{ trophy.title }}
					</h2>
					<div class="-subtitle small text-muted">
						<template v-if="isGame">
							<router-link
								:to="game.routeLocation"
								class="-subtitle-link link-unstyled"
								v-app-tooltip="game.title"
							>
								<AppJolticon icon="gamepad" />
								<span v-translate="{ title: game.title }">
									Game Trophy of
									<b>%{ title }</b>
								</span>
							</router-link>
						</template>
						<template v-else>
							<AppJolticon icon="gamejolt" />
							<span>Game Jolt Trophy</span>
							<router-link
								v-if="artist"
								:to="artist.url"
								class="-subtitle-link link-unstyled"
							>
								<span class="dot-separator" />
								<AppUserCardHover :user="artist">
									<span v-translate="{ username: artist.username }">
										Art by
										<b>@%{ username }</b>
									</span>
									<span class="-subtitle-avatar">
										<AppUserAvatarImg :user="artist" />
									</span>
								</AppUserCardHover>
							</router-link>
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
								<span class="dot-separator small" v-if="Screen.isDesktop" />
								<br v-else />
								<span v-if="completionPercentageForDisplay === 1">
									<AppTranslate
										>&lt;1% of players achieved this trophy</AppTranslate
									>
								</span>
								<span v-else-if="completionPercentageForDisplay === 100">
									<AppTranslate>
										100% of players achieved this trophy
									</AppTranslate>
								</span>
								<span v-else v-translate="{ num: completionPercentageForDisplay }">
									~%{ num }% of players achieved this trophy
								</span>
							</span>

							<div class="-description well fill-offset">
								{{ trophy.description }}
							</div>

							<div v-if="shouldShowFriends" class="small">
								<div>
									<AppTranslate>Friends who achieved this trophy</AppTranslate>
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

<style lang="stylus" src="./modal.styl" scoped></style>
