<script lang="ts" setup>
import { computed, ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyPill from '../../../../_common/currency/AppCurrencyPill.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack, {
	StickerPackRatio,
} from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackOpenModal } from '../../../../_common/sticker/pack/open-modal/modal.service';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import { useStickerStore } from '../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { kThemeBgActual } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleWhen } from '../../../../_styles/mixins';
import { illNoCommentsSmall } from '../../../img/ill/illustrations';

import imageVance from './vance.png';

const { coinBalance } = useCommonStore();
const { stickerPacks } = useStickerStore();
const modal = useModal()!;

const isPurchasingPack = ref(false);
const isLoading = ref(true);

const availablePacks = ref<StickerPack[]>([]);

run(async () => {
	const p = await Promise.all([
		Api.sendFieldsRequest(
			'/mobile/sticker',
			{
				availablePacks: true,
			},
			{ detach: true }
		),
		Api.sendFieldsRequest(
			'/mobile/me',
			{
				coinBalance: true,
			},
			{ detach: true }
		),
	]);

	const payload = p[0];
	availablePacks.value = StickerPack.populate(payload.availablePacks);

	const mePayload = p[1];
	coinBalance.value = mePayload.coinBalance;

	isLoading.value = false;
});

async function purchasePack(pack: StickerPack) {
	if (isPurchasingPack.value) {
		return;
	}

	if (pack.cost_coins > coinBalance.value) {
		showErrorGrowl($gettext(`You don't have enough coins to purchase this.`));
		return;
	}

	isPurchasingPack.value = true;

	try {
		const payload = await Api.sendRequest(
			`/web/stickers/purchase-pack/${pack.id}`,
			{},
			{ detach: true }
		);

		const rawNewPack = payload.pack;
		if (!rawNewPack) {
			throw Error('No pack was returned when trying to purchase one.');
		}

		const newPack = new UserStickerPack(rawNewPack);

		let newBalance = payload.coinBalance;
		if (typeof newBalance !== 'number') {
			newBalance = coinBalance.value - pack.cost_coins;
		}
		coinBalance.value = Math.max(newBalance, 0);

		stickerPacks.value.push(newPack);

		// Show the PackOpen modal. This should ask them if they want to open
		// right away or save their pack for later.
		StickerPackOpenModal.show({
			pack: newPack,
			openImmediate: false,
		});
	} catch (e) {
		console.error('Error while purchasing pack.', e);

		showErrorGrowl(
			$gettext(`Something went wrong trying to purchase that pack. Try again later.`)
		);
	} finally {
		isPurchasingPack.value = false;
	}
}

// Make the vending machine content full-height for phone sizes.
const containerStyles = computed(() =>
	styleWhen(Screen.isXs, {
		display: `flex`,
		flexDirection: `column`,
		minHeight: `100vh`,
	})
);

// Make the vending machine content full-height for phone sizes.
const loadingFadeStyles = computed(() =>
	styleWhen(Screen.isXs, {
		flex: `auto`,
		display: `flex`,
		flexDirection: `column`,
	})
);

// Make the vending machine content full-height for phone sizes.
const loadingFadeContentStyles = loadingFadeStyles;
</script>

<template>
	<AppModal>
		<div :style="containerStyles">
			<AppModalFloatingHeader>
				<template #modal-controls>
					<AppCurrencyPill
						:style="{
							alignSelf: 'flex-end',
							marginRight: 'auto',
						}"
						currency="coins"
						:amount="coinBalance"
					/>

					<AppButton @click="modal.dismiss()">
						{{ $gettext(`Close`) }}
					</AppButton>
				</template>
			</AppModalFloatingHeader>

			<div class="modal-body _wrapper">
				<AppLoadingFade
					:style="loadingFadeStyles"
					:content-styles="loadingFadeContentStyles"
					:is-loading="isLoading"
				>
					<div
						class="_packs"
						:style="
							styleWhen(!isLoading && !availablePacks.length, {
								gridTemplateColumns: '1fr',
								alignContent: 'center',
							})
						"
					>
						<template v-if="isLoading">
							<AppAspectRatio
								v-for="i in 3"
								:key="i"
								:ratio="StickerPackRatio"
								show-overflow
							>
								<div class="_pack-placeholder" />
							</AppAspectRatio>
						</template>
						<template v-else-if="availablePacks.length">
							<template v-for="pack in availablePacks" :key="pack.id">
								<div
									:style="{
										position: 'relative',
									}"
								>
									<AppStickerPack
										class="_pack"
										:pack="pack"
										:can-click-pack="coinBalance >= pack.cost_coins"
										show-details
										:expiry-info="pack.ends_on"
										@click-pack="purchasePack(pack)"
									>
										<template #overlay>
											<div
												v-if="coinBalance < pack.cost_coins"
												class="_radius-lg _text-shadow"
												:style="{
													position: 'absolute',
													top: 0,
													right: 0,
													bottom: 0,
													left: 0,
													fontSize: '13px',
													padding: '8px',
													zIndex: 2,
													display: 'grid',
													justifyContent: 'center',
													alignContent: 'center',
													textAlign: 'center',
													fontWeight: 'bold',
													backgroundColor: 'rgba(0, 0, 0, 0.45)',
												}"
											>
												{{ $gettext(`Insufficient coin balance`) }}
											</div>
										</template>
									</AppStickerPack>
								</div>
							</template>
						</template>
						<AppIllustration v-else :asset="illNoCommentsSmall">
							<div>
								{{ $gettext(`There are no sticker packs available for purchase.`) }}
							</div>
						</AppIllustration>
					</div>
				</AppLoadingFade>

				<AppScrollAffix
					:style="{
						zIndex: 2,
					}"
					anchor="bottom"
					:offset-top="0"
					:padding="0"
				>
					<div
						:style="{
							position: 'relative',
							backgroundColor: kThemeBgActual,
						}"
					>
						<!-- vance -->
						<AppSpacer vertical :scale="4" />
						<AppAspectRatio :ratio="1000 / 250">
							<img
								:src="imageVance"
								:style="{
									width: `100%`,
									height: `100%`,
									userSelect: `none`,
								}"
								alt="Vending Vance"
							/>
						</AppAspectRatio>
						<AppSpacer vertical :scale="4" />

						<!-- Rounded corner decorators -->
						<div class="_output-corner-tl">
							<div class="_output-corner-tl-border" />
							<div class="_output-corner-bg" />
						</div>
						<div class="_output-corner-tr">
							<div class="_output-corner-tr-border" />
							<div class="_output-corner-bg" />
						</div>
					</div>
				</AppScrollAffix>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
._wrapper
	padding-top: 0
	padding-bottom: 0
	flex: auto
	display: flex
	flex-direction: column

._radius-lg
	rounded-corners-lg()

._text-shadow
	overlay-text-shadow()

._balance
	change-bg(bg-offset)
	rounded-corners-lg()
	padding: 2px 6px
	align-self: flex-end
	margin-right: auto
	font-weight: bold

._packs
	--pack-min-width: 200px
	rounded-corners-lg()
	change-bg(bg-offset)
	color: var(--theme-fg)
	position: relative
	overflow: hidden
	min-height: calc(min(45vh, 800px))
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(var(--pack-min-width), 1fr))
	align-content: start
	gap: 12px
	padding: 12px
	border-bottom-left-radius: 0
	border-bottom-right-radius: 0
	flex: auto

	@media $media-xs
		--pack-min-width: 140px

._pack-placeholder
	rounded-corners-lg()
	change-bg(bg-subtle)
	elevate-1()
	width: 100%
	height: 100%

._pack
	z-index: 1

._output-corner-tl
._output-corner-tr
	width: 12px
	height: 12px
	position: absolute
	top: -12px
	z-index: 3

._output-corner-tl-border
._output-corner-tr-border
	border: 6px solid var(--theme-bg-offset)

._output-corner-tl
	left: 0

._output-corner-tr
	right: 0

._output-corner-tl-border
	border-bottom-left-radius: 12px

._output-corner-tr-border
	border-bottom-right-radius: 12px

._output-corner-bg
	background-color: var(--theme-bg)
	width: 100%
	height: 100%
	position: absolute
	left: 0
	top: 0
	z-index: -1
</style>
