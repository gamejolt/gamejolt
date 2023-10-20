<script lang="ts" setup>
import { PropType, onUnmounted, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import AppFadeCollapse from '../../../_common/AppFadeCollapse.vue';
import AppButton from '../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { GameBundleModel } from '../../../_common/game-bundle/game-bundle.model';
import { CustomGameMessage, GameModel } from '../../../_common/game/game.model';
import AppGamePackageCard from '../../../_common/game/package/card/AppGamePackageCard.vue';
import { GamePackagePayloadModel } from '../../../_common/game/package/package-payload.model';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { KeyGroupModel, KeyGroupType } from '../../../_common/key-group/key-group.model';
import AppMediaItemCover from '../../../_common/media-item/cover/AppMediaItemCover.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';

const ClaimGameThemeKey = 'claim-game';

const props = defineProps({
	payload: {
		type: Object as PropType<any>,
		required: true,
	},
	loginUrl: {
		type: String,
		required: true,
	},
	accessKey: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	claim: (_game: GameModel) => true,
});

const { payload, loginUrl, accessKey } = toRefs(props);

const { user } = useCommonStore();
const { setPageTheme, clearPageTheme } = useThemeStore();
const route = useRoute();

const showingThanks = ref(typeof route.query.thanks !== 'undefined');
const isClaimOnly = ref(false);
const canToggleDescription = ref(false);
const showingFullDescription = ref(false);

const game = ref(new GameModel(payload.value.game));
const bundle = ref(payload.value.bundle ? new GameBundleModel(payload.value.bundle) : null);
const keyGroup = ref(payload.value.keyGroup ? new KeyGroupModel(payload.value.keyGroup) : null);
const gameIsLocked = ref(payload.value.gameIsLocked ?? false);
const customGameMessages = ref<CustomGameMessage[]>([]);
const packagePayload = ref<GamePackagePayloadModel | null>(null);

if (
	keyGroup.value &&
	(keyGroup.value.type === KeyGroupType.User ||
		keyGroup.value.type === KeyGroupType.AnonymousClaim)
) {
	isClaimOnly.value = true;
} else {
	customGameMessages.value = payload.value.customMessages;

	packagePayload.value =
		payload.value.packages && payload.value.packages.length
			? new GamePackagePayloadModel(payload.value)
			: null;
}

setPageTheme({
	key: ClaimGameThemeKey,
	theme: game.value.theme ?? null,
});

onUnmounted(() => {
	clearPageTheme(ClaimGameThemeKey);
});

function claim() {
	emit('claim', game.value);
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
				{{ $gettext('Back to Bundle') }}
			</AppButton>
		</template>

		<div class="text-center">
			<h1>{{ game.title }}</h1>
			<h4>
				{{ $gettext('by') }}
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
			<div v-if="!user" class="alert full-bleed full-bleed-xs text-center">
				<p>
					<a :href="loginUrl">
						{{
							$gettext(
								'Sign in to Game Jolt to be able to claim this game into your Library.'
							)
						}}
					</a>
				</p>
			</div>
			<p v-else>
				<AppButton primary block @click="claim">
					{{ $gettext('Claim Game into Library') }}
				</AppButton>
			</p>
		</template>

		<AppFadeCollapse
			:collapse-height="isClaimOnly ? 10_000 : 400"
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
				{{ $gettext('Releases') }}
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
				{{ $gettext('No releases yet.') }}
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
