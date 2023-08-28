<script lang="ts">
import { computed, CSSProperties, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
validateFilesize,
validateImageAspectRatio,
validateImageMaxDimensions,
validateImageMinDimensions,
} from '../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelpDocs from '../../../../_common/link/AppLinkHelpDocs.vue';
import { ModelData } from '../../../../_common/model/model.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerPack, {
StickerPackRatio,
} from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { $gettext, $ngettext } from '../../../../_common/translate/translate.service';
import { styleFlexCenter, styleWhen } from '../../../../_styles/mixins';
import { kLineHeightComputed } from '../../../../_styles/variables';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppStickerEditTile from './_edit/AppStickerEditTile.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/creators/stickers'),
	}),
};

type InitPayload = {
	emojiPrefix: string | null | undefined;
	stickers: ModelData<StickerModel>[];
	pack: ModelData<StickerPackModel> | null;
	maxStickerAmount: number;
	stickerSlots: number;
};

type PackFormModel = Partial<StickerPackModel>;
</script>

<script lang="ts" setup>
const stickers = ref([]) as Ref<StickerModel[]>;
const pack = ref(null) as Ref<StickerPackModel | null>;
const maxStickerAmount = ref(5);
const stickerSlots = ref(100);

const emojiPrefix = ref('');

const packMaxFilesize = ref(5 * 1024 * 1024);
const packMinWidth = ref(128);
const packMinHeight = ref(packMinWidth.value / StickerPackRatio);
const packMaxWidth = ref(packMinWidth.value * 4);
const packMaxHeight = ref(packMinHeight.value * 4);
const packAspectRatio = ref(StickerPackRatio);

const requiredActiveStickers = computed(() => {
	if (pack.value) {
		return Math.max(pack.value.payout_sticker_num, 1);
	}
	return 3;
});

const isPackDisabled = computed(() => {
	if (!pack.value) {
		return true;
	}

	let activeStickers = 0;
	for (const sticker of stickers.value) {
		if (sticker.is_active) {
			++activeStickers;
		}

		if (activeStickers >= requiredActiveStickers.value) {
			break;
		}
	}
	return activeStickers < requiredActiveStickers.value;
});

const routeTitle = computed(() => $gettext(`Your Stickers`));

const packForm: FormController<PackFormModel> = createForm({
	loadUrl: '/web/dash/creators/stickers/save-pack',
	model: ref({ ...pack.value }),
	onLoad(payload) {
		packMaxFilesize.value = payload.maxFilesize ?? packMaxFilesize.value;
		packMinWidth.value = payload.minWidth ?? packMinWidth.value;
		packMinHeight.value = payload.minHeight ?? packMinHeight.value;
		packMaxWidth.value = payload.maxWidth ?? packMaxWidth.value;
		packMaxHeight.value = payload.maxHeight ?? packMaxHeight.value;
		packAspectRatio.value = payload.aspectRatio ?? packAspectRatio.value;

		packForm.formModel.is_active = (pack.value?.is_active ?? payload.is_active) === true;
	},
	onSubmit() {
		return Api.sendRequest(`/web/dash/creators/stickers/save-pack`, packForm.formModel, {
			detach: true,
			file: packForm.formModel.file,
		});
	},
	onSubmitError(response) {
		let message: string | null = null;

		const reason = response.reason;
		if (reason === 'not-enough-active-stickers') {
			message = $ngettext(
				`You need at least %{ num } active sticker to enable your sticker pack.`,
				`You need at least %{ num } active stickers to enable your sticker pack.`,
				requiredActiveStickers.value,
				{ num: requiredActiveStickers.value }
			);
		}

		showErrorGrowl(message || $gettext(`Could not update your sticker pack. Try again later.`));
	},
	onSubmitSuccess(payload) {
		pack.value = new StickerPackModel(payload.pack);
	},
});

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved(data) {
		const payload: InitPayload = data.payload;

		emojiPrefix.value = payload.emojiPrefix || '';

		stickers.value = StickerModel.populate(payload.stickers);
		pack.value = payload.pack ? new StickerPackModel(payload.pack) : null;
		maxStickerAmount.value = payload.maxStickerAmount;
		stickerSlots.value = payload.stickerSlots;

		if (pack.value) {
			packForm.formModel.is_active = pack.value.is_active === true;
		}
	},
});

const canCreateSticker = computed(() => stickers.value.length < stickerSlots.value);
const activeStickersCount = computed(() => stickers.value.filter(i => i.is_active).length);
const canActivateSticker = computed(() => activeStickersCount.value < maxStickerAmount.value);

const warnDeactivateSticker = computed(() => {
	// Don't warn if pack is already inactive.
	if (pack.value && !pack.value.is_active) {
		return false;
	}

	const minActiveStickers = pack.value?.payout_sticker_num ?? 3;
	const currentActiveStickers = activeStickersCount.value;
	return currentActiveStickers <= minActiveStickers;
});

const stickerGridStyles = computed(() => {
	const result: CSSProperties = {
		display: `grid`,
		gap: `16px`,
	};

	if (Screen.isXs) {
		result.gridTemplateColumns = `repeat(auto-fill, minmax(120px, 1fr))`;
	} else {
		const perRow = Math.min(stickerSlots.value, 5);
		result.gridTemplateColumns = `repeat(${perRow}, 1fr)`;
	}

	return result;
});

const showStickerPackDisabledWarning = computed(() => {
	if (!pack.value || pack.value.is_active) {
		return false;
	}

	// Show if the pack is inactive, and there are enough active stickers to enable it.
	const minActiveStickers = pack.value.payout_sticker_num;
	const currentActiveStickers = activeStickersCount.value;

	return currentActiveStickers >= minActiveStickers;
});

function updatePack(newPack: StickerPackModel | undefined) {
	if (newPack) {
		pack.value = newPack;
		packForm.formModel.is_active = newPack.is_active === true;
	} else {
		pack.value = null;
		packForm.formModel.is_active = false;
	}
}

function onFileUploadChanged() {
	if (packForm.formModel.file) {
		packForm.submit();
	}
}

function onPackEnabledChanged() {
	// If an invalid file was attached, clear it before changing our enabled
	// state.
	if (packForm.controlErrors.file) {
		packForm.formModel.file = null;
	}
	packForm.submit();
}
</script>

<template>
	<!-- RouteDashStickersEdit -->
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<div
					v-if="showStickerPackDisabledWarning"
					class="fill-notice well"
					:style="{
						display: 'flex',
						gridGap: '16px',
						alignItems: 'center',
					}"
				>
					<AppJolticon icon="exclamation-circle" big />
					<div>
						<div :style="{ fontWeight: 'bold' }">
							{{ $gettext(`Your sticker pack is currently turned off! `) }}
						</div>
						<div>
							{{
								$gettext(
									`You can enable it again since you have enough active stickers. If you don't enable it, others won't be able to get or see your sticker pack.`
								)
							}}
						</div>
					</div>
				</div>

				<div>
					<h1
						:style="{
							marginTop: 0,
							display: `flex`,
							alignItems: `flex-end`,
						}"
					>
						{{ $gettext(`Stickers`) }}
					</h1>

					<div class="help-block">
						<p>
							{{
								$gettext(
									`Create custom stickers that will show up in your own personalized sticker pack! You may edit or disable stickers at any time, but you'll need some enabled to include them in your sticker pack.`
								)
							}}
						</p>
						<p>
							{{
								$gettext(`%{ usedSlots } / %{ maxSlots } slots used`, {
									usedSlots: stickers.length.toString(),
									maxSlots: stickerSlots.toString(),
								})
							}}
							<br />
							{{
								$gettext(`%{ currentAmount } / %{ maxAmount } active stickers`, {
									currentAmount: activeStickersCount.toString(),
									maxAmount: maxStickerAmount.toString(),
								})
							}}
						</p>
					</div>

					<div :style="stickerGridStyles">
						<template v-if="!isBootstrapped">
							<AppStickerEditTile v-for="i in maxStickerAmount" :key="i" />
						</template>
						<template v-else>
							<AppStickerEditTile
								v-for="sticker in stickers"
								:key="sticker.id"
								:current-emoji-prefix="emojiPrefix"
								:sticker="sticker"
								:stickers="stickers"
								:can-activate="canActivateSticker"
								:warn-deactivate="warnDeactivateSticker"
								show-name
								@pack="updatePack"
							/>

							<AppStickerEditTile
								v-if="canCreateSticker"
								:current-emoji-prefix="emojiPrefix"
								:stickers="stickers"
								:can-activate="canActivateSticker"
								@pack="updatePack"
							>
								<template #no-sticker>
									<div
										:style="{
											...styleFlexCenter({ direction: 'column' }),
											width: `100%`,
											height: `100%`,
											fontWeight: `bold`,
											padding: `12px`,
										}"
									>
										<AppJolticon
											:style="{
												margin: `0 0 16px 0`,
											}"
											icon="add"
											big
										/>

										<div class="text-center">
											{{ $gettext(`Add a sticker`) }}
										</div>
									</div>
								</template>
							</AppStickerEditTile>
						</template>
					</div>
				</div>

				<div v-if="pack && pack.media_item">
					<AppForm :controller="packForm">
						<h1>
							{{ $gettext(`Pack`) }}
						</h1>

						<div class="help-block">
							{{
								$gettext(
									`Enable your sticker pack to make it available for other users! You can disable it at any time, and only stickers you have enabled will show up in your pack.`
								)
							}}
						</div>

						<div>
							<AppFormGroup
								name="is_active"
								:style="{
									marginBottom: kLineHeightComputed.px,
								}"
								:label="$gettext(`Enable pack`)"
								tiny-label-margin
							>
								<AppFormControlToggle
									:disabled="isPackDisabled"
									@changed="onPackEnabledChanged()"
								/>

								<AppExpand :when="isPackDisabled">
									<div class="help-block">
										{{
											$ngettext(
												`You need at least %{ min } active sticker to enable this pack.`,
												`You need at least %{ min } active stickers to enable this pack.`,
												requiredActiveStickers,
												{ min: requiredActiveStickers }
											)
										}}
									</div>
								</AppExpand>
							</AppFormGroup>
						</div>

						<div
							:style="{
								display: `flex`,
								gap: kLineHeightComputed.px,
								...styleWhen(Screen.isXs, {
									flexDirection: `column`,
								}),
							}"
						>
							<div
								:style="{
									maxWidth: `240px`,
									flex: `1 1 240px`,
								}"
							>
								<AppStickerPack
									:style="{
										width: `100%`,
									}"
									:pack="pack"
								/>
							</div>

							<div
								:style="{
									flex: `1 1 75%`,
								}"
							>
								<AppFormGroup
									name="file"
									:label="$gettext(`Upload your pack image`)"
									tiny-label-margin
									:optional="!!pack"
								>
									<p v-translate class="help-block">
										Your sticker pack image must be a PNG or JPG.
										<br />
										PNGs are recommended because they produce lossless images.
									</p>
									<p
										v-translate="{
											min: `${packMinWidth}×${packMinHeight}`,
											max: `${packMaxWidth}×${packMaxHeight}`,
										}"
										class="help-block strong"
									>
										Sticker pack images must be between
										<code>%{min}</code>
										and
										<code>%{max}</code>
										(ratio of 2 ÷ 3).
									</p>

									<p class="help-block">
										<AppLinkHelpDocs
											category="creators"
											page="stickers"
											class="link-help"
										>
											{{
												$gettext(
													`What are the sticker pack image requirements and guidelines?`
												)
											}}
										</AppLinkHelpDocs>
									</p>

									<AppFormControlUpload
										:validators="[
											validateFilesize(packMaxFilesize),
											validateImageMinDimensions({
												width: packMinWidth,
												height: packMinHeight,
											}),
											validateImageMaxDimensions({
												width: packMaxWidth,
												height: packMaxHeight,
											}),
											validateImageAspectRatio({ ratio: packAspectRatio }),
										]"
										accept=".png,.jpg,.jpeg,.webp"
										fix-overflow
										@changed="onFileUploadChanged()"
									/>

									<AppFormControlErrors :label="$gettext(`sticker pack image`)" />
								</AppFormGroup>
							</div>
						</div>
					</AppForm>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
