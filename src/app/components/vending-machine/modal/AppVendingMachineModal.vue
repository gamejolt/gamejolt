<script lang="ts" setup>
import { ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { useModal } from '../../../../_common/modal/modal.service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { $gettext } from '../../../../_common/translate/translate.service';

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
	console.warn(payload, mePayload);
	coinBalance.value = mePayload.coinBalance;
	isLoading.value = false;
});

function onSubmit() {
	// showSuccessGrowl({
	// 	title: $gettext(`Request Sent`),
	// 	message: $gettext(
	// 		`Your request has been sent and will be processed within 3 days. At the time it's processed, your balance will be updated to reflect the changes.`
	// 	),
	// 	sticky: true,
	// });

	modal.resolve();
}

async function purchasePack(pack: StickerPack) {
	if (isPurchasingPack.value) {
		return;
	}

	if (pack.cost_coins > coinBalance.value) {
		showErrorGrowl($gettext(`You don't have enough coins to purchase this.`));
		return;
	}

	const canProceed = await ModalConfirm.show($gettext(`Are you sure you want to purchase this?`));
	if (!canProceed) {
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

		purchasedPackX.value = Math.random();
		purchasedPack.value = pack;
		coinBalance.value = payload.coinBalance;

		// TODO(sticker-collections-2) Add an easy way to open the purchased
		// back immediately.
	} catch (e) {
		console.error('Error while purchasing pack.', e);
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
		<AppModalFloatingHeader>
			<template #modal-controls>
				<div class="-balance">
					<span>{{ formatNumber(coinBalance) }}</span>
					{{ ' ' }}
					<!-- TODO(sticker-collections-2) coin jolticon? -->
					<span>🪙</span>
				</div>

				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>
		</AppModalFloatingHeader>

		<div class="modal-body -container">
			<div class="-packs">
				<div class="-glass-overlay">
					<div class="-glass-1" />
					<div class="-glass-2" />
				</div>

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
							TODO: on click this should spawn a copy with position: fixed and placed roughly where this element
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
	</AppModal>
</template>

<style lang="stylus" scoped>
.-container
	padding-top: 0
	padding-bottom: 0

.-balance
	margin-top: 12px
	margin-right: auto
	font-weight: 600

.-packs
	rounded-corners-lg()
	change-bg(bg-offset)
	color: var(--theme-fg)
	position: relative
	overflow: hidden

	min-height: 400px
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))
	gap: 12px
	padding: 12px
	padding-bottom: 0
	border-bottom-left-radius: 0
	border-bottom-right-radius: 0

.-pack
	z-index: 1

.-glass-overlay
	position: absolute
	top: -300px
	left: 0
	bottom: 0
	right: 0
	transform: rotateZ(35deg)
	opacity: 0.15
	user-select: none
	pointer-events: none
	z-index: 2

.-glass-1
	position: absolute
	top: 0
	left: 0px
	background-color: white
	width: 80px
	height: 1000px

.-glass-2
	position: absolute
	top: 0
	left: 110px
	background-color: white
	width: 20px
	height: 1000px

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
