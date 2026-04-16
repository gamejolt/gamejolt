<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import AppButton from '~common/button/AppButton.vue';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '~common/environment/environment.service';
import { CustomGameMessage, GameModel } from '~common/game/game.model';
import AppGamePackageCard from '~common/game/package/card/AppGamePackageCard.vue';
import { GamePackagePayloadModel } from '~common/game/package/package-payload.model';
import { GameBundleModel } from '~common/game-bundle/game-bundle.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { KeyGroupModel, KeyGroupType } from '~common/key-group/key-group.model';
import AppMediaItemCover from '~common/media-item/cover/AppMediaItemCover.vue';
import { useCommonStore } from '~common/store/common-store';
import { useThemeStore } from '~common/theme/theme.store';

const ClaimGameThemeKey = 'claim-game';

type Props = {
	payload: any;
	loginUrl: string;
	accessKey?: string;
};
const { payload, loginUrl, accessKey } = defineProps<Props>();

const emit = defineEmits<{
	claim: [game: GameModel];
}>();

const { user } = useCommonStore();
const { setPageTheme, clearPageTheme } = useThemeStore();
const route = useRoute();

const showingThanks = ref(typeof route.query.thanks !== 'undefined');
const isClaimOnly = ref(false);
const canToggleDescription = ref(false);
const showingFullDescription = ref(false);

const game = ref(new GameModel(payload.game));
const bundle = ref(payload.bundle ? new GameBundleModel(payload.bundle) : null);
const keyGroup = ref(payload.keyGroup ? new KeyGroupModel(payload.keyGroup) : null);
const gameIsLocked = ref(payload.gameIsLocked ?? false);
const customGameMessages = ref<CustomGameMessage[]>([]);
const packagePayload = ref<GamePackagePayloadModel | null>(null);

if (
	keyGroup.value &&
	(keyGroup.value.type === KeyGroupType.User ||
		keyGroup.value.type === KeyGroupType.AnonymousClaim)
) {
	isClaimOnly.value = true;
} else {
	customGameMessages.value = payload.customMessages;

	packagePayload.value =
		payload.packages && payload.packages.length
			? new GamePackagePayloadModel(payload)
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
					:sellable="pkg._sellable!"
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
