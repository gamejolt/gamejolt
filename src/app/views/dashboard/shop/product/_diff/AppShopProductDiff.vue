<script lang="ts">
import { CSSProperties, PropType, computed, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import {
	defineDynamicSlotProps,
	useDynamicSlots,
} from '../../../../../../_common/component-helpers';
import { CreatorChangeRequestModel } from '../../../../../../_common/creator/change-request/creator-change-request.model';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon, { Jolticon } from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { storeModel } from '../../../../../../_common/model/model-store.service';
import AppNavTabList from '../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import {
	kThemeBgOffset,
	kThemeFg,
	kThemeFg10,
	kThemeGjOverlayNotice,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleTextOverflow,
	styleWhen,
} from '../../../../../../_styles/mixins';
import { kFontSizeBase } from '../../../../../../_styles/variables';
import { arrayRemove } from '../../../../../../utils/array';
import { isInstance } from '../../../../../../utils/utils';
import { routeDashShopOverview } from '../../overview/overview.route';
import { useShopManagerStore } from '../../shop.store';
import { ShopProductBaseForm } from '../_forms/FormShopProductBase.vue';
import { ShopItemStates } from '../_item/AppDashShopItem.vue';
import AppShopProductDiffImg from './AppShopProductDiffImg.vue';
import AppShopProductDiffMeta from './AppShopProductDiffMeta.vue';

const SlotProps = ['before', 'after'] as const;
</script>

<script lang="ts" setup>
const props = defineProps({
	...defineDynamicSlotProps(SlotProps, true),
	data: {
		type: Object as PropType<ShopProductBaseForm>,
		required: true,
	},
});

const { dynamicSlots } = toRefs(props);
const { hasSlot } = useDynamicSlots(dynamicSlots);

const router = useRouter();

const {
	avatarFrames,
	backgrounds,
	stickerPacks,
	stickers,
	getShopItemStates,
	changeRequests,
	getChangeRequestKey,
} = useShopManagerStore()!;

// eslint-disable-next-line vue/no-setup-props-destructure
const {
	form,
	typename,
	baseModel,
	initialFormModel,
	existingImgUrl,
	tempImgUrl,
	diffData,
	diffKeys,
	changeRequest,
	rejectedChangeRequest,
	latestChangeRequest,
} = props.data;

const tabSlot = ref<(typeof SlotProps)[number]>(hasSlot('before') ? 'before' : 'after');
watch(
	() => hasSlot('after'),
	(hasAfter, prev) => {
		if (!!hasAfter === !!prev) {
			return;
		}
		tabSlot.value = hasAfter ? 'after' : 'before';
	}
);

const useTabView = computed(() => Screen.isMobile);
const availableTabs = computed(() => {
	const tabs: (typeof SlotProps)[number][] = [];
	if (useTabView.value) {
		const { before, after } = diffData.value.binding;
		if (before) {
			tabs.push('before');
		}
		if (after) {
			tabs.push('after');
		}
	}
	return tabs;
});

const itemStates = computed<ShopItemStates>(() => {
	if (!latestChangeRequest.value) {
		return {};
	}
	return getShopItemStates(latestChangeRequest.value);
});

const itemStateDisplay = computed(() => {
	const { inReview, rejected } = itemStates.value;

	let text: string;
	let icon: Jolticon;
	const style: CSSProperties = {
		...styleBorderRadiusLg,
		...styleFlexCenter({
			display: `inline-flex`,
			gap: `6px`,
		}),
		borderRadius: `12px`,
		padding: `2px 8px`,
		backgroundColor: kThemeFg10,
		color: kThemeFg,
		fontSize: kFontSizeBase.px,
		fontWeight: `bold`,
		marginRight: `auto`,
	};

	if (inReview) {
		icon = 'clock';
		text = $gettext(`In review`);
	} else if (rejected) {
		icon = 'exclamation-circle';
		text = $gettext(`Changes rejected`);
		style.backgroundColor = kThemeGjOverlayNotice;
		style.color = `white`;
	} else {
		return null;
	}

	return {
		text,
		icon,
		style,
	};
});

function isChargePack(model: typeof baseModel): model is StickerPackModel {
	return isInstance(model, StickerPackModel) && !model.is_premium;
}

const isPublished = computed(() => {
	// Non-premium sticker packs are published if they're enabled.
	if (isChargePack(baseModel)) {
		return baseModel.is_active === true;
	}
	return baseModel?.has_active_sale === true;
});

function getSlotText(slot: (typeof SlotProps)[number]) {
	if (slot === 'before') {
		return $gettext(`Current product`);
	} else if (slot === 'after') {
		return hasSlot('before') ? $gettext(`New changes`) : $gettext(`New product`);
	}
}

function getExtraDiffData(target: typeof form.formModel) {
	return diffKeys.reduce((acc, key) => {
		if (Object.hasOwn(form.formModel, key)) {
			acc[key] = target[key];
		}
		return acc;
	}, {} as any);
}

async function setProductPublishState(publish: boolean) {
	if (!baseModel) {
		return;
	}

	const _isChargePack = isChargePack(baseModel);
	let confirmText: string;
	if (publish) {
		if (_isChargePack) {
			confirmText = $gettext(`Are you sure you want to enable this charge sticker pack?`);
		} else {
			confirmText = $gettext(`Are you sure you want to publish this product to the shop?`);
		}
	} else {
		if (_isChargePack) {
			confirmText = $gettext(`Are you sure you want to disable this charge sticker pack?`);
		} else {
			confirmText = $gettext(`Are you sure you want to remove this product from the shop?`);
		}
	}

	const canContinue = await showModalConfirm(confirmText);
	if (!canContinue) {
		return;
	}

	let url: string;
	let postData: any = {};
	if (isChargePack(baseModel)) {
		url = `/web/dash/creators/shop/packs/set-enabled`;
		postData = {
			pack_id: baseModel.id,
			is_enabled: publish,
		};
	} else if (publish) {
		url = `/web/dash/creators/shop/sales/create/${typename}/${baseModel.id}`;
	} else {
		url = `/web/dash/creators/shop/sales/remove/${typename}/${baseModel.id}`;
	}

	try {
		const response = await Api.sendRequest(url, postData, { detach: true });

		if (response.pack) {
			// TODO(creator-shops) free sticker packs don't have `is_active`
			// updated - returns the old value.
			storeModel(StickerPackModel, response.pack);
		} else if (response.resource) {
			// TODO(creator-shops) This only works to publish sometimes, though
			// it's teated as a success.
			//
			// To replicate:
			// - publish an item that hasn't been published before
			// - unpublish the item
			// - publish the item again
			switch (typename) {
				case 'Avatar_Frame':
					storeModel(AvatarFrameModel, response.resource);
					break;
				case 'Background':
					storeModel(BackgroundModel, response.resource);
					break;
				case 'Sticker_Pack':
					storeModel(StickerPackModel, response.resource);
					break;
				case 'Sticker':
					storeModel(StickerModel, response.resource);
					break;
			}
		}
	} catch (e) {
		console.error(`Error processing publish state change.`, { publish }, e);
		showErrorGrowl($gettext(`Something went wrong. Please try again in a few minutes.`));
	}
}

async function cancelChangeRequest() {
	const changes = latestChangeRequest.value;
	if (!changes) {
		return;
	}

	const canContinue = await showModalConfirm(
		baseModel?.was_approved
			? $gettext(`Are you sure you want to cancel your pending change request?`)
			: $gettext(
					`Are you sure you want to cancel your pending change request? This will delete the item.`
			  )
	);
	if (!canContinue) {
		return;
	}

	try {
		const response = await Api.sendRequest(
			`/web/dash/creators/shop/change-requests/cancel/${changes.id}`,
			{},
			{ detach: true }
		);

		const request = response.request
			? storeModel(CreatorChangeRequestModel, response.request)
			: null;
		changeRequest.value = request?.rejected_on ? null : request;
		rejectedChangeRequest.value = request?.rejected_on ? request : null;

		const key = baseModel ? getChangeRequestKey(baseModel) : null;
		if (key) {
			if (request) {
				changeRequests.value.set(key, request);
			} else {
				changeRequests.value.delete(key);
			}
		}

		if (!latestChangeRequest.value && baseModel && !baseModel.was_approved) {
			// Remove the item from the store if it was never approved and we
			// have no change request remaining.
			switch (typename) {
				case 'Avatar_Frame':
					arrayRemove(avatarFrames.value.items, i => i.id === baseModel.id);
					break;
				case 'Background':
					arrayRemove(backgrounds.value.items, i => i.id === baseModel.id);
					break;
				case 'Sticker_Pack':
					arrayRemove(stickerPacks.value.items, i => i.id === baseModel.id);
					break;
				case 'Sticker':
					arrayRemove(stickers.value.items, i => i.id === baseModel.id);
					break;
			}

			// Navigate back to the overview since there's no item anymore.
			router.push({
				name: routeDashShopOverview.name,
			});
		}
	} catch (e) {
		console.error(`Error canceling pending change request.`, e);
		showErrorGrowl($gettext(`Something went wrong. Please try again in a few minutes.`));
	}
}

const afterSlotInnerHeaderType = computed(() => {
	// TODO(creator-shops) Figure out if we should improve this by checking
	// diffs instead of [form.changed] once it's decided how to refactor the
	// form flow.
	if (!form.changed && latestChangeRequest.value) {
		return 'cancel-button';
	} else if (diffData.value.hasChange || !latestChangeRequest.value) {
		return 'viewing-preview-text';
	}
	return null;
});

const gridViewStyles = computed<CSSProperties>(() => {
	const areas = ['a', 'arrow', 'b'];
	// Creating a new product will only use the `after` slot. Reverse the grid
	// areas so it shows on the left.
	if (!diffData.value.binding.before) {
		areas.reverse();
	}
	return {
		display: `grid`,
		gridTemplateColumns: `minmax(0, 1fr) 36px minmax(0, 1fr)`,
		// The double-quotes are required.
		gridTemplateAreas: `"${areas.join(' ')}"`,
		gap: `16px`,
		alignItems: `center`,
	};
});

const tabViewStyles: CSSProperties = {
	position: `relative`,
};

const headerStyles: CSSProperties = {
	...styleTextOverflow,
	marginTop: 0,
	marginBottom: `4px`,
	minWidth: 0,
};

const sectionStyles: CSSProperties = {
	height: `100%`,
	display: `flex`,
	flexDirection: `column`,
};

function getDiffContainerStyles(slot: 'before' | 'arrow' | 'after'): CSSProperties {
	if (!useTabView.value) {
		return {
			position: `relative`,
			width: `100%`,
			height: slot === 'arrow' ? `36px` : `100%`,
			gridArea: slot === 'before' ? 'a' : slot === 'after' ? 'b' : slot,
		};
	}

	if (slot === 'arrow') {
		return {
			display: `none`,
			visibility: `hidden`,
		};
	}

	// Always try to render this or we may have content shifting as images are
	// loaded in.
	return {
		...styleWhen(slot !== tabSlot.value, {
			...styleAbsoluteFill({ zIndex: -1 }),
			pointerEvents: `none`,
		}),
	};
}

const diffCardDecoratorStyles = computed<CSSProperties>(() => {
	return {
		...styleBorderRadiusLg,
		...styleElevate(1),
		backgroundColor: kThemeBgOffset,
		padding: `24px`,
		...styleWhen(Screen.isXs, {
			padding: `12px`,
		}),
	};
});

const innerDiffCardHeaderStyles = computed<CSSProperties>(() => {
	return {
		...styleFlexCenter(),
		gap: `12px`,
		height: `40px`,
		marginBottom: `24px`,
		...styleWhen(useTabView.value, {
			gap: `8px`,
			marginBottom: `12px`,
		}),
	};
});

const diffCardStyles = computed<CSSProperties>(() => {
	return {
		display: `flex`,
		flexDirection: `column`,
	};
});

const jolticonStyles: CSSProperties = {
	margin: 0,
	fontSize: `24px`,
	justifySelf: `center`,
	alignSelf: `center`,
};
</script>

<template>
	<div>
		<!-- Tab view -->
		<AppNavTabList v-if="useTabView">
			<ul>
				<li v-for="slot in availableTabs" :key="slot">
					<a :class="{ active: tabSlot === slot }" @click="tabSlot = slot">
						{{ getSlotText(slot) }}
					</a>
				</li>
			</ul>
		</AppNavTabList>

		<div
			:style="[
				useTabView ? tabViewStyles : gridViewStyles,
				{
					marginBottom: `16px`,
				},
			]"
		>
			<!-- Before -->
			<div :style="getDiffContainerStyles('before')">
				<Transition name="fade">
					<div v-if="hasSlot('before') || useTabView" :style="sectionStyles">
						<!-- Header -->
						<h6 v-if="!useTabView" :style="headerStyles">
							{{ $gettext(`Current product`) }}
						</h6>

						<!-- Diff card -->
						<div :style="diffCardDecoratorStyles">
							<!-- Inner header/controls -->
							<!-- This needs to always show to maintain the same height between items. -->
							<div :style="innerDiffCardHeaderStyles">
								<template
									v-if="
										baseModel &&
										baseModel.was_approved &&
										!isInstance(baseModel, StickerModel)
									"
								>
									<div :style="{ position: `relative`, marginLeft: `auto` }">
										<!-- TODO(creator-shops) Figure out what to
										do about this disabled state once it's
										decided how the form flow should be
										refactored. It currently won't allow
										publishing/unpublishing if the initialized
										form doesn't match the approved baseModel
										(editing a product with a change request).
										-->
										<AppButton
											:disabled="diffData.hasChange"
											solid
											:primary="!isPublished"
											@click="setProductPublishState(!isPublished)"
										>
											<template v-if="isPublished">
												{{
													isChargePack(baseModel)
														? $gettext(`Disable charge pack`)
														: $gettext(`Remove from shop`)
												}}
											</template>
											<template v-else>
												{{
													isChargePack(baseModel)
														? $gettext(`Enable charge pack`)
														: $gettext(`Publish to shop`)
												}}
											</template>
										</AppButton>

										<div
											v-if="diffData.hasChange"
											v-app-tooltip.touchable="
												$gettext(
													`You can't do this if you have unsaved changes.`
												)
											"
											:style="styleAbsoluteFill()"
										/>
									</div>
								</template>
							</div>

							<!-- Diff view -->
							<div :style="diffCardStyles">
								<slot
									name="before"
									v-bind="{ imgUrl: existingImgUrl, model: initialFormModel }"
								>
									<AppShopProductDiffImg
										:typename="typename"
										:img-url="existingImgUrl"
										:style="{ marginBottom: `16px` }"
									/>
									<AppShopProductDiffMeta
										:current="{
											name: initialFormModel.name,
											...getExtraDiffData(initialFormModel),
										}"
									/>
								</slot>
							</div>
						</div>
					</div>
				</Transition>
			</div>

			<div v-if="!useTabView" :style="getDiffContainerStyles('arrow')">
				<!-- Diff arrow -->
				<Transition name="fade">
					<AppJolticon
						v-if="hasSlot('before') && hasSlot('after')"
						icon="arrow-right"
						:style="jolticonStyles"
					/>
					<div v-else />
				</Transition>
			</div>

			<div :style="getDiffContainerStyles('after')">
				<!-- After -->
				<Transition name="fade">
					<div v-if="hasSlot('after') || useTabView" :style="sectionStyles">
						<!-- Header -->
						<h6 v-if="!useTabView" :style="headerStyles">
							{{
								hasSlot('before')
									? $gettext(`New changes`)
									: $gettext(`New product`)
							}}
						</h6>

						<!-- Diff card -->
						<div :style="diffCardDecoratorStyles">
							<!-- Inner header/controls -->
							<div :style="innerDiffCardHeaderStyles">
								<div
									v-if="afterSlotInnerHeaderType === 'viewing-preview-text'"
									class="text-center"
									:style="{ fontWeight: `bold` }"
								>
									{{ $gettext(`Preview of changes`) }}
								</div>
								<template v-else>
									<div v-if="itemStateDisplay" :style="itemStateDisplay.style">
										<AppJolticon
											:icon="itemStateDisplay.icon"
											:style="{
												margin: 0,
												color: `inherit`,
												fontSize: `inherit`,
											}"
										/>

										{{ itemStateDisplay.text }}
									</div>

									<template v-if="afterSlotInnerHeaderType === 'cancel-button'">
										<!-- Cancel pending changes -->
										<AppButton
											:style="{ marginLeft: `auto` }"
											solid
											@click="cancelChangeRequest()"
										>
											{{
												baseModel?.was_approved
													? $gettext(`Cancel`)
													: $gettext(`Remove`)
											}}
										</AppButton>
									</template>
								</template>
							</div>

							<!-- Diff view -->
							<div :style="diffCardStyles">
								<slot
									name="after"
									v-bind="{ imgUrl: tempImgUrl, model: form.formModel }"
								>
									<AppShopProductDiffImg
										:typename="typename"
										:img-url="tempImgUrl"
										:style="{ marginBottom: `16px` }"
									/>

									<AppShopProductDiffMeta
										:current="{
											name: form.formModel.name || '',
											...getExtraDiffData(form.formModel),
										}"
										:other="initialFormModel"
										:diff-color="kThemePrimaryFg"
										:diff-background="kThemePrimary"
									/>
								</slot>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
// Delay is added here so diffs don't fade in/out when there's an immediate form
// error with the image file selected.
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out
	transition-delay: 100ms

.fade-enter-from
.fade-leave-to
	opacity: 0
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
</style>
