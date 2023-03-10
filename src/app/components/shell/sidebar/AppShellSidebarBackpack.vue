<script lang="ts" setup>
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyPill from '../../../../_common/currency/AppCurrencyPill.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackOpenModal } from '../../../../_common/sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import {
	getStickerCountsFromPayloadData,
	useStickerStore,
} from '../../../../_common/sticker/sticker-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { styleBorderRadiusLg, styleChangeBg, styleTextOverflow } from '../../../../_styles/mixins';
import { illPointyThing } from '../../../img/ill/illustrations';
import { useAppStore } from '../../../store';
import { routeQuests } from '../../../views/quests/quests.route';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';

type FormModel = {
	// nothing
};

const { stickerPacks, eventStickers, creatorStickers, generalStickers, allStickers } =
	useStickerStore();
const { coinBalance } = useAppStore();

const form: FormController<FormModel> = createForm({
	loadUrl: `/mobile/sticker`,
	loadData: {
		_fields: {
			ownedPacks: true,
			ownedStickers: true,
			unreadStickerIds: true,
		},
	},
	sanitizeComplexData: false,
	onInit() {
		run(async () => {
			const payload = await Api.sendFieldsRequest(
				'/mobile/me',
				{ coinBalance: true },
				{ detach: true }
			);

			coinBalance.value = payload.coinBalance;
		});
	},
	async onLoad(payload) {
		stickerPacks.value = UserStickerPack.populate(payload.ownedPacks);

		const data = getStickerCountsFromPayloadData({
			stickerCounts: payload.ownedStickers.stickerCounts,
			stickers: payload.ownedStickers.stickers,
		});

		eventStickers.value = data.eventStickers;
		creatorStickers.value = data.creatorStickers;
		generalStickers.value = data.generalStickers;
	},
});

async function onClickVendingMachine() {
	await showVendingMachineModal();
}

function openPack(pack: UserStickerPack) {
	StickerPackOpenModal.show({
		pack,
		openImmediate: true,
	});
}
</script>

<template>
	<div id="shell-sidebar-backpack" class="fill-offset">
		<AppForm :controller="form">
			<div
				:style="{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
				}"
			>
				<AppButton block solid @click="onClickVendingMachine()">
					{{ $gettext(`Get packs`) }}
				</AppButton>

				<AppCurrencyPill
					:style="{
						flex: 'none',
					}"
					currency="coins"
					:amount="coinBalance"
				/>
			</div>

			<AppSpacer vertical :scale="4" />
			<RouterLink class="link-unstyled" :to="{ name: routeQuests.name }">
				<div
					class="well"
					:style="{
						...styleBorderRadiusLg,
						...styleChangeBg('bg-offset'),
					}"
				>
					{{
						$gettext(
							`Complete quests to earn coins that you can use to purchase packs!`
						)
					}}
				</div>
			</RouterLink>

			<AppSpacer vertical :scale="4" />

			<div class="_section-header">
				{{ $gettext(`Sticker packs`) }}
			</div>
			<div v-if="stickerPacks.length" class="_packs">
				<AppStickerPack
					v-for="userPack in stickerPacks"
					:key="userPack.id"
					:pack="userPack.sticker_pack"
					:show-details="{
						name: true,
						expiry: true,
					}"
					can-click-pack
					:hover-title="$gettext(`Open`)"
					@click-pack="openPack(userPack)"
				/>
			</div>
			<div v-else>
				<AppIllustration :asset="illPointyThing" />

				<p class="text-center">
					{{ $gettext(`You currently have no packs to open.`) }}
				</p>
			</div>

			<AppSpacer vertical :scale="8" />

			<div class="_section-header">
				{{ $gettext(`Stickers`) }}
			</div>

			<div v-if="eventStickers.length">
				<div
					v-if="generalStickers.length || creatorStickers.size"
					class="_section-subheader"
				>
					{{ $gettext(`Event stickers`) }}
				</div>

				<div class="_stickers">
					<AppStickerLayerDrawerItem
						v-for="{ sticker, sticker_id, count } in eventStickers"
						:key="sticker_id"
						:sticker="sticker"
						:count="count"
						fit-parent
						no-drag
					/>
				</div>
			</div>

			<template v-if="creatorStickers.size">
				<div v-for="[creator, stickers] in creatorStickers" :key="creator.id">
					<template v-if="stickers.length">
						<div
							class="_section-subheader"
							:style="{
								maxWidth: `100%`,
								display: `inline-flex`,
								alignItems: `center`,
								gap: `6px`,
							}"
						>
							<AppUserAvatar
								:style="{
									width: `16px`,
									height: `16px`,
								}"
								:user="creator"
								disable-link
							/>

							<div
								:style="{
									...styleTextOverflow,
									minWidth: 0,
								}"
							>
								{{
									$gettextInterpolate(`@%{ username } stickers`, {
										username: creator.username,
									})
								}}
							</div>
						</div>

						<div class="_stickers">
							<AppStickerLayerDrawerItem
								v-for="{ sticker, sticker_id, count } in stickers"
								:key="sticker_id"
								:sticker="sticker"
								:count="count"
								fit-parent
								no-drag
							/>
						</div>
					</template>
				</div>
			</template>

			<div v-if="generalStickers.length">
				<div v-if="eventStickers.length || creatorStickers.size" class="_section-subheader">
					{{ $gettext(`General stickers`) }}
				</div>

				<div class="_stickers">
					<AppStickerLayerDrawerItem
						v-for="{ sticker, sticker_id, count } in generalStickers"
						:key="sticker_id"
						:sticker="sticker"
						:count="count"
						fit-parent
						no-drag
					/>
				</div>
			</div>

			<div v-if="!allStickers.length">
				<p class="text-center">
					{{ $gettext(`You have no stickers. Open packs to get some!`) }}
				</p>
				<AppButton block trans @click="onClickVendingMachine()">
					{{ $gettext(`Get packs`) }}
				</AppButton>
			</div>
		</AppForm>
	</div>
</template>

<style lang="stylus" scoped>
#shell-sidebar-backpack
	--base-pad: 16px
	--half-pad: calc(var(--base-pad) * 0.5)
	padding: var(--base-pad)

._radius-lg
	rounded-corners-lg()

._section-header
	margin-top: 0
	font-family: $font-family-display
	font-weight: 800
	font-size: $font-size-large
	margin-bottom: var(--half-pad)

._section-subheader
	margin-top: 0
	font-size: $font-size-small
	margin-bottom: var(--half-pad)
	color: var(--theme-fg-muted)

._packs
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(3, 1fr)

	@media $media-xs
		grid-template-columns: repeat(2, 1fr)

._stickers
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr))
	margin-bottom: $line-height-computed
</style>
