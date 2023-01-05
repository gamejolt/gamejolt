<script lang="ts" setup>
import { ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import { useStickerStore } from '../../../../_common/sticker/sticker-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { showVendingMachinePurchaseModal } from './purchase-modal/modal.service';

const { stickerPacks } = useStickerStore();
const modal = useModal()!;

const isPurchasingPack = ref(false);
const isLoading = ref(true);

const availablePacks = ref<StickerPack[]>();
const coinBalance = ref(0);
const purchasedPack = ref<StickerPack | null>(null);
const purchasedPackX = ref(0);

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
				doCoinBalance: true,
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

	// TODO(sticker-collections-2) Change to a popper-like wrapper component.
	const purchaseMethod = await showVendingMachinePurchaseModal({ pack });
	if (!purchaseMethod) {
		return;
	}

	purchasedPack.value = null;
	isPurchasingPack.value = true;

	try {
		const payload = await Api.sendRequest(
			`/web/stickers/purchase-pack/${pack.id}`,
			{},
			{ detach: true }
		);

		const rawNewPack = payload.pack;
		// TODO(sticker-collections-2) Check actual payload errors
		if (!rawNewPack) {
			throw Error('No pack was returned when trying to purchase one.');
		}

		const newPack = new UserStickerPack(rawNewPack);
		purchasedPackX.value = Math.random();
		purchasedPack.value = newPack.sticker_pack;

		let newBalance = payload.coinBalance;
		if (typeof newBalance !== 'number') {
			newBalance = coinBalance.value - pack.cost_coins;
		}
		coinBalance.value = Math.max(newBalance, 0);

		if (purchaseMethod === 'purchase') {
			stickerPacks.value.push(newPack);
		} else if (purchaseMethod === 'purchase-and-open') {
			// TODO(sticker-collections-2) remove
		}
	} catch (e) {
		console.error('Error while purchasing pack.', e);

		showErrorGrowl(
			$gettext(`Something went wrong trying to purchase that pack. Try again later.`)
		);
	} finally {
		isPurchasingPack.value = false;
	}
}

function getPurchasedPackX() {
	return (0.1 + purchasedPackX.value) * 0.75 * 100 + '%';
}
</script>

<template>
	<AppModal>
		<div class="-container">
			<AppModalFloatingHeader>
				<template #modal-controls>
					<div class="-balance">
						<span>{{ formatNumber(coinBalance) }}</span>
						{{ ' ' }}
						<!-- TODO(sticker-collections-2) coin jolticon -->
						<span>🪙</span>
					</div>

					<AppButton @click="modal.dismiss()">
						{{ $gettext(`Close`) }}
					</AppButton>
				</template>
			</AppModalFloatingHeader>

			<div class="modal-body -wrapper">
				<div class="-packs">
					<AppStickerPack
						v-for="pack in availablePacks"
						:key="pack.id"
						class="-pack"
						:pack="pack"
						can-click-pack
						show-details
						@click-pack="purchasePack(pack)"
					/>
				</div>

				<AppScrollAffix anchor="bottom" :offset-top="0" :padding="0">
					<div class="-output-bg">
						<div class="-output-corner-tl">
							<div class="-output-corner-tl-border" />
							<div class="-output-corner-bg" />
						</div>
						<div class="-output-corner-tr">
							<div class="-output-corner-tr-border" />
							<div class="-output-corner-bg" />
						</div>

						<AppSpacer vertical :scale="4" />

						<div class="-output">
							<div class="-output-face">
								<div class="-output-face-eye" />
								<div class="-output-face-mouth" />
								<div class="-output-face-eye" />
							</div>

							<div class="-purchased">
								<!--
								TODO(sticker-collections) on click this should spawn a copy with position: fixed and placed roughly where this element
								currently is. Then remove this element.
								Get the screen position of the #shell-sidebar-backpack element, and move the newly spawned element
								towards it while shrinking it, to signify that the purchased pack moved to the backpack.
								-->
								<AppStickerPack
									v-if="purchasedPack"
									:pack="purchasedPack"
									class="-purchased-pack"
									:style="{
										left: getPurchasedPackX(),
									}"
								/>
							</div>
						</div>

						<AppSpacer vertical :scale="4" />
					</div>
				</AppScrollAffix>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
// Make the vending machine full-height for phone sizes
.-container
	@media $media-xs
		display: flex
		flex-direction: column
		min-height: 100vh

.-wrapper
	padding-top: 0
	padding-bottom: 0
	flex: auto
	display: flex
	flex-direction: column

.-balance
	align-self: flex-end
	margin-right: auto
	font-weight: 600

.-packs
	rounded-corners-lg()
	change-bg(bg-offset)
	color: var(--theme-fg)
	position: relative
	overflow: hidden
	min-height: calc(min(40vh, 400px))
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))
	gap: 12px
	padding: 12px
	border-bottom-left-radius: 0
	border-bottom-right-radius: 0
	flex: auto

.-pack
	z-index: 1

.-output-bg
	position: relative
	background-color: var(--theme-bg-actual)

.-output-corner-tl
.-output-corner-tr
	width: 12px
	height: 12px
	position: absolute
	top: -12px
	z-index: 3

.-output-corner-tl-border
.-output-corner-tr-border
	border: 6px solid var(--theme-bg-offset)

.-output-corner-tl
	left: 0

.-output-corner-tr
	right: 0

.-output-corner-tl-border
	border-bottom-left-radius: 12px

.-output-corner-tr-border
	border-bottom-right-radius: 12px

.-output-corner-bg
	background-color: var(--theme-bg)
	width: 100%
	height: 100%
	position: absolute
	left: 0
	top: 0
	z-index: -1

.-output
	height: 96px
	rounded-corners-lg()
	overflow: hidden
	background-color: #31d6ff
	box-shadow: inset 20px 20px #187899
	position: relative

.-output-face
	display: flex
	justify-content: center
	padding-top: 16px

.-output-face-eye
	height: 40px
	width: 16px
	rounded-corners-lg()
	background-color: black

.-output-face-mouth
	width: 64px
	height: 12px
	rounded-corners-lg()
	background-color: black
	margin-left: 32px
	margin-right: 32px
	margin-top: 32px

.-purchased
	position: absolute
	top: 0
	left: 0
	bottom: 0
	right: 0
	overflow: hidden

.-purchased-pack
	position: absolute
	top: 0
	width: 80px
	filter: drop-shadow(6px 6px 0 #187899)
	animation-name: purchased-pack
	animation-duration: 0.25s
	animation-iteration-count: 1
	animation-fill-mode: forwards

@keyframes purchased-pack
	0%
		transform: translateY(-150px) rotateZ(-20deg)

	100%
		transform: translateY(-5px) rotateZ(-20deg)
</style>
