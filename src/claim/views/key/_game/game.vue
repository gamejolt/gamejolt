<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { CustomMessage as CustomGameMessage, Game } from '../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { KeyGroup } from '../../../../_common/key-group/key-group.model';
import AppMediaItemCover from '../../../../_common/media-item/cover/AppMediaItemCover.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';

const ClaimGameThemeKey = 'claim-game';

@Options({
	components: {
		AppFadeCollapse,
		AppGamePackageCard,
		AppMediaItemCover,
		AppContentViewer,
	},
})
export default class AppKeyGame extends Vue {
	@Prop({ required: true })
	payload!: any;

	@Prop({ type: String, required: true })
	loginUrl!: string;

	@Prop(String)
	accessKey?: string;

	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());

	get app() {
		return this.commonStore;
	}

	showingThanks = false;
	isClaimOnly = false;

	game: Game = null as any;
	bundle: GameBundle | null = null;
	keyGroup: KeyGroup | null = null;
	packagePayload: GamePackagePayloadModel | null = null;
	gameIsLocked = false;

	canToggleDescription = false;
	showingFullDescription = false;

	customGameMessages: CustomGameMessage[] = [];

	Environment = Environment;

	@Emit('claim')
	emitClaim(_game: Game) {}

	created() {
		this.showingThanks = typeof this.$route.query.thanks !== 'undefined';

		this.game = new Game(this.payload.game);
		this.bundle = this.payload.bundle ? new GameBundle(this.payload.bundle) : null;
		this.keyGroup = this.payload.keyGroup ? new KeyGroup(this.payload.keyGroup) : null;
		this.gameIsLocked = this.payload.gameIsLocked ?? false;
		this.setPageTheme();

		if (
			this.keyGroup &&
			(this.keyGroup.type === KeyGroup.TYPE_USER ||
				this.keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM)
		) {
			this.isClaimOnly = true;
			return;
		}

		this.customGameMessages = this.payload.customMessages || [];

		if (this.payload.packages && this.payload.packages.length) {
			this.packagePayload = new GamePackagePayloadModel(this.payload);
		}
	}

	unmounted() {
		this.themeStore.clearPageTheme(ClaimGameThemeKey);
	}

	private setPageTheme() {
		const theme = this.game.theme ?? null;
		this.themeStore.setPageTheme({
			key: ClaimGameThemeKey,
			theme,
		});
	}

	claim() {
		this.emitClaim(this.game);
	}
}
</script>

<template>
	<div>
		<div class="game-cover">
			<AppMediaItemCover v-if="game.header_media_item" :media-item="game.header_media_item" />
		</div>

		<!-- If this game is in a bundle, show a back button. -->
		<template v-if="bundle">
			<br />
			<AppButton
				block
				:to="{
					name: 'key',
					params: $route.params,
					query: {},
				}"
			>
				<AppTranslate>Back to Bundle</AppTranslate>
			</AppButton>
		</template>

		<div class="text-center">
			<h1>{{ game.title }}</h1>
			<h4>
				<AppTranslate>by</AppTranslate>
				{{ ' ' }}
				<a class="link-unstyled" :href="Environment.baseUrl + game.developer.url">
					{{ game.developer.display_name }}
				</a>
			</h4>
		</div>

		<div v-if="showingThanks" class="alert full-bleed full-bleed-xs">
			<p><strong>Thanks for buying the game!</strong></p>
			<p>
				We've emailed you your key's URL (this page) just so you can always find it. You are
				able to find your download(s) below. Any future updates to the game will be
				available here as well.
			</p>
			<p>~ Warm thanks from both {{ game.developer.display_name }} and the Game Jolt team.</p>
		</div>

		<template v-if="!bundle && !gameIsLocked">
			<div v-if="!app.user" class="alert full-bleed full-bleed-xs text-center">
				<p>
					<a :href="loginUrl">
						<AppTranslate>
							Sign in to Game Jolt to be able to claim this game into your Library.
						</AppTranslate>
					</a>
				</p>
			</div>
			<p v-else>
				<AppButton primary block @click="claim">
					<AppTranslate>Claim Game into Library</AppTranslate>
				</AppButton>
			</p>
		</template>

		<AppFadeCollapse
			:collapse-height="isClaimOnly ? undefined : 400"
			:is-open="showingFullDescription"
			@require-change="canToggleDescription = $event"
			@expand="showingFullDescription = true"
		>
			<AppContentViewer :source="game.description_content" />
		</AppFadeCollapse>

		<a
			v-if="canToggleDescription"
			class="hidden-text-expander"
			@click="showingFullDescription = !showingFullDescription"
		/>

		<template v-if="!isClaimOnly">
			<br v-if="customGameMessages.length" />

			<div
				v-for="(msg, i) of customGameMessages"
				:key="i"
				class="alert full-bleed-xs"
				:class="{
					'alert-notice': msg.type === 'alert',
				}"
			>
				<AppJolticon icon="notice" />
				<span v-html="msg.message" />
			</div>

			<h2>
				<AppTranslate>Releases</AppTranslate>
			</h2>

			<div v-if="packagePayload && packagePayload.packages.length" class="packages-list">
				<AppGamePackageCard
					v-for="pkg of packagePayload.packages"
					:key="pkg.id"
					:game="game"
					:sellable="pkg._sellable"
					:package="pkg"
					:releases="pkg._releases"
					:builds="pkg._builds"
					:access-key="accessKey"
				/>
			</div>

			<div v-else class="alert alert-notice">
				<AppTranslate>No releases yet.</AppTranslate>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.game-cover
	margin-top: -($grid-gutter-width / 2)
	margin-right: -($grid-gutter-width-xs / 2)
	margin-left: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-right: -($grid-gutter-width / 2)
		margin-left: -($grid-gutter-width / 2)

h1
	margin-top: $line-height-computed * 2
	margin-bottom: 0

h4
	theme-prop('color', 'fg-muted')
	margin-top: 0
	margin-bottom: $line-height-computed * 2
</style>
