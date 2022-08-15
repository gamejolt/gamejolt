<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../../../../../../_common/user/user-avatar/img/img.vue';
import { User } from '../../../../../../../_common/user/user.model';
import { GameSupportersModal } from '../../../../../../components/game/supporters/modal/modal.service';
import { useGameRouteController } from '../../view.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserCardHover,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppDiscoverGamesViewOverviewSupporters extends Vue {
	@Prop(Array)
	supporters!: User[];

	@Prop(Number)
	supporterCount!: number;

	routeStore = setup(() => useGameRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	viewAll() {
		GameSupportersModal.show({
			game: this.game,
			supporters: this.supporters,
			supporterCount: this.supporterCount,
		});
	}
}
</script>

<template>
	<div class="-supporters">
		<h4 class="-heading">
			<AppTranslate>Supporters</AppTranslate>
			<AppJolticon
				v-app-tooltip.touchable="
					$gettext(
						`The kind people that supported by paying more than the minimum. Sorted by amount contributed.`
					)
				"
				class="text-muted"
				icon="help-circle"
			/>
		</h4>

		<div class="-list">
			<div class="-list-fade" />
			<div v-for="user of supporters.slice(0, 16)" :key="user.id" class="-supporter">
				<AppUserCardHover :user="user">
					<router-link class="user-avatar" :to="user.url">
						<AppUserAvatarImg :user="user" />
					</router-link>
				</AppUserCardHover>
			</div>
		</div>

		<div class="-all">
			<AppButton trans @click="viewAll()">
				<AppTranslate>View All</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-size = 30px
$-spacing = 3px

.-supporters
	display: flex
	flex-flow: row wrap
	margin-bottom: $line-height-computed

.-heading
	flex: none
	margin: 0
	margin-right: $-spacing * 3
	line-height: $-size

	// On xs, we make the heading take up its own row (the 100%).
	@media $media-xs
		flex: 1 100%

.-all
	flex: none

.-list
	position: relative
	flex: 1
	display: flex
	overflow: hidden

.-list-fade
	position: absolute
	top: 0
	right: 0
	bottom: 0
	width: 50px
	background-image: linear-gradient(to right, var(--theme-bg-actual-trans) 0, var(--theme-bg-actual) 100%)
	z-index: 1

.-supporter
	img-circle()
	flex: none
	width: $-size
	height: $-size
	margin: 0 $-spacing
	overflow: hidden
</style>
