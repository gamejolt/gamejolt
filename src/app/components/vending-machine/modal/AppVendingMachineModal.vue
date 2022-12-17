<script lang="ts" setup>
import { ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';

const modal = useModal()!;

const isLoading = ref(true);
const availablePacks = ref<StickerPack[]>();
const coinBalance = ref(0);
const displayMessage = ref('<<< PLEASE SELECT PACK');
const displayMessageProgress = ref(0);
const purchasedPack = ref<StickerPack | null>(null);
const purchasedPackX = ref(0);

run(async () => {
	const payload = await Api.sendFieldsRequest(
		'/mobile/sticker',
		{
			availablePacks: true,
		},
		{ detach: true }
	);

	availablePacks.value = StickerPack.populate(payload.availablePacks);

	const mePayload = await Api.sendFieldsRequest(
		'/mobile/me',
		{
			coinBalance: true,
		},
		{ detach: true }
	);

	coinBalance.value = mePayload.coinBalance;

	isLoading.value = false;
});

setInterval(() => {
	if (displayMessageProgress.value < displayMessage.value.length) {
		displayMessageProgress.value++;
	}
}, 50);

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

function setDisplayMessage(message: string) {
	displayMessage.value = message;
	displayMessageProgress.value = 0;
}

function getDisplayMessage() {
	return displayMessage.value.substr(0, displayMessageProgress.value);
}

async function purchasePack(pack: StickerPack) {
	purchasedPack.value = null;

	if (pack.cost_coins > coinBalance.value) {
		setDisplayMessage(`NOT ENOUGH CREDIT! ${pack.cost_coins} NEEDED`);
		return;
	}

	setDisplayMessage('PURCHASING...');

	const payload = await Api.sendRequest(
		`/web/stickers/purchase-pack/${pack.id}`,
		{},
		{ detach: true }
	);

	purchasedPackX.value = Math.random();
	purchasedPack.value = pack;
	coinBalance.value = payload.coinBalance;

	setDisplayMessage('THANK YOU <3 PLEASE COLLECT YOUR PACK');
}

function getPurchasedPackX() {
	return (0.1 + purchasedPackX.value) * 0.75 * 100 + '%';
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body -container">
			<div class="-selection">
				<div class="-packs">
					<div class="-glass-overlay">
						<div class="-glass-1" />
						<div class="-glass-2" />
					</div>
					<div
						v-for="pack in availablePacks"
						:key="pack.id"
						class="-pack"
						@click="purchasePack(pack)"
					>
						<AppStickerPack :pack="pack" />
					</div>
				</div>

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
			</div>
			<div class="-controls">
				<div class="-display">
					{{ getDisplayMessage() }}
				</div>
				<dic class="-buttons">
					<div class="-button" />
					<div class="-button" />
					<div class="-button" />
					<div class="-button" />
					<div class="-button" />
					<div class="-button" />
				</dic>
				<div>COINS: {{ coinBalance }}</div>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-container
	display: flex

.-selection
	width: 67%

.-packs
	rounded-corners-lg()
	border-color: var(--theme-darkest)
	background-color: var(--theme-darkest)
	display: flex
	height: 400px
	flex-wrap: wrap
	justify-content: center
	position: relative
	overflow: hidden

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

.-pack
	margin: 10px
	cursor: pointer
	height: 120px

.-output
	margin-top: 32px
	height: 96px
	rounded-corners-lg()
	overflow: hidden
	// background-color: var(--theme-primary)
	background-color: #31d6ff
	box-shadow: inset 20px 20px #187899
	position: relative

	&-face
		display: flex
		justify-content: center
		padding-top: 16px

		&-eye
			height: 40px
			width: 16px
			rounded-corners-lg()
			background-color: black

		&-mouth
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

	&-pack
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

.-controls
	width: 33%
	margin-left: 12px

.-display
	background-color: var(--theme-highlight)
	border-color: var(--theme-backlight)
	border-style: solid
	border-width: 4px
	rounded-corners()
	height: 112px
	margin-left: 12px
	margin-right: 12px
	padding: 12px
	color: var(--theme-backlight)
	font-family: monospace
	font-weight: bold

.-buttons
	margin-top: 16px
	display: flex
	flex-wrap: wrap
	justify-content: center
	padding-left: 32px
	padding-right: 32px

.-button
	border-radius: 50%
	background-color: var(--theme-fg-muted)
	width: 32px
	height: 32px
	margin: 8px
</style>
