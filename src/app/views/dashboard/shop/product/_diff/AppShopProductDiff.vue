<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { CreatorChangeRequestModel } from '../../../../../../_common/creator/change-request/creator-change-request.model';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { storeModel } from '../../../../../../_common/model/model-store.service';
import AppNavTabList from '../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemePrimary, kThemePrimaryFg } from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleAbsoluteFill, styleWhen } from '../../../../../../_styles/mixins';
import { arrayRemove } from '../../../../../../utils/array';
import { assertNever, isInstance } from '../../../../../../utils/utils';
import { routeDashShopOverview } from '../../overview/overview.route';
import { ShopDashProductStates, useShopDashStore } from '../../shop.store';
import { ShopProductBaseForm } from '../_forms/FormShopProductBase.vue';
import AppShopProductDiffCard from './AppShopProductDiffCard.vue';
import AppShopProductDiffImg from './AppShopProductDiffImg.vue';
import AppShopProductDiffMeta from './AppShopProductDiffMeta.vue';
import AppShopProductDiffState from './AppShopProductDiffState.vue';

const props = defineProps({
	data: {
		type: Object as PropType<ShopProductBaseForm>,
		required: true,
	},
});

type Section = 'before' | 'after';

const router = useRouter();

const {
	avatarFrames,
	backgrounds,
	stickerPacks,
	stickers,
	getShopProductStates,
	storeChangeRequest,
	removeChangeRequest,
} = useShopDashStore()!;

// eslint-disable-next-line vue/no-setup-props-destructure
const {
	form,
	resource,
	baseModel,
	initialFormModel,
	existingImgUrl,
	tempImgUrl,
	diffData,
	diffKeys,
	changeRequest,
} = props.data;

const currentSection = ref<Section>(diffData.value.hasBefore ? 'before' : 'after');

watch(
	() => diffData.value.hasAfter,
	(hasAfter, prev) => {
		if (!!hasAfter === !!prev) {
			return;
		}
		currentSection.value = hasAfter ? 'after' : 'before';
	}
);

const useTabView = computed(() => Screen.isMobile);
const availableTabs = computed(() => {
	const tabs: Section[] = [];
	if (useTabView.value) {
		const { hasBefore, hasAfter } = diffData.value;
		if (hasBefore) {
			tabs.push('before');
		}
		if (hasAfter) {
			tabs.push('after');
		}
	}
	return tabs;
});

const isChargePack = computed(
	() => isInstance(baseModel, StickerPackModel) && !baseModel.is_premium
);

const currentStates = computed<ShopDashProductStates>(() => {
	if (!baseModel) {
		return {};
	}
	return getShopProductStates(baseModel);
});

const changeStates = computed<ShopDashProductStates>(() => {
	if (!changeRequest.value) {
		return {};
	}
	return getShopProductStates(changeRequest.value);
});

function getSectionLabel(section: Section) {
	if (section === 'before') {
		return $gettext(`Current`);
	} else if (section === 'after') {
		return diffData.value.hasBefore ? $gettext(`New changes`) : $gettext(`New product`);
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

	let confirmText: string;
	if (isChargePack.value) {
		confirmText = publish
			? $gettext(
					`Ready to publish this reward pack and gift it to those that pay you in charged stickers?`
			  )
			: $gettext(
					`Are you sure you want to unpublish this reward pack? Your supporters will no longer receive it when they give you charged stickers.`
			  );
	} else {
		confirmText = publish
			? $gettext(`Ready to make this available in your shop?`)
			: $gettext(
					`Are you sure you want to take this out of your shop? Those who've already bought it can still use it.`
			  );
	}

	const canContinue = await showModalConfirm(confirmText);
	if (!canContinue) {
		return;
	}

	let url: string;
	let postData: any = {};
	if (isChargePack.value) {
		url = `/web/dash/creators/shop/packs/set-enabled`;
		postData = {
			pack_id: baseModel.id,
			is_enabled: publish,
		};
	} else if (publish) {
		url = `/web/dash/creators/shop/sales/create/${resource}/${baseModel.id}`;
	} else {
		url = `/web/dash/creators/shop/sales/remove/${resource}/${baseModel.id}`;
	}

	try {
		const response = await Api.sendRequest(url, postData, { detach: true });

		if (response.pack) {
			storeModel(StickerPackModel, response.pack);
		} else if (response.resource) {
			switch (resource) {
				case ShopProductResource.AvatarFrame:
					storeModel(AvatarFrameModel, response.resource);
					break;
				case ShopProductResource.Background:
					storeModel(BackgroundModel, response.resource);
					break;
				case ShopProductResource.StickerPack:
					storeModel(StickerPackModel, response.resource);
					break;
				case ShopProductResource.Sticker:
					storeModel(StickerModel, response.resource);
					break;
				default:
					assertNever(resource);
			}
		}
	} catch (e) {
		console.error(`Error processing publish state change.`, { publish }, e);
		showErrorGrowl($gettext(`Something went wrong. Please try again in a few minutes.`));
	}
}

async function cancelChangeRequest() {
	const changes = changeRequest.value;
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

		const updatedChangeRequest = response.request
			? storeModel(CreatorChangeRequestModel, response.request)
			: null;

		if (!baseModel) {
			return;
		}

		if (updatedChangeRequest) {
			storeChangeRequest(baseModel, updatedChangeRequest);
		} else {
			removeChangeRequest(baseModel);
		}

		if (!updatedChangeRequest && !baseModel.was_approved) {
			// Remove the item from the store if it was never approved and we
			// have no change request remaining.
			switch (resource) {
				case ShopProductResource.AvatarFrame:
					arrayRemove(avatarFrames.value.items, i => i.id === baseModel.id);
					break;
				case ShopProductResource.Background:
					arrayRemove(backgrounds.value.items, i => i.id === baseModel.id);
					break;
				case ShopProductResource.StickerPack:
					arrayRemove(stickerPacks.value.items, i => i.id === baseModel.id);
					break;
				case ShopProductResource.Sticker:
					arrayRemove(stickers.value.items, i => i.id === baseModel.id);
					break;
				default:
					assertNever(resource);
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

const gridViewStyles = computed<CSSProperties>(() => {
	const areas = ['before', 'arrow', 'after'];
	// Creating a new product will only use the `after` section. Reverse the
	// grid areas so it shows on the left.
	if (!diffData.value.hasBefore) {
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

function getDiffContainerStyles(gridArea: 'before' | 'arrow' | 'after'): CSSProperties {
	return useTabView.value
		? {
				// Always render the inactive sections or we may have content
				// shifting as images are loaded in when switching between
				// sections.
				...styleWhen(gridArea !== currentSection.value, {
					...styleAbsoluteFill({ zIndex: -1 }),
					pointerEvents: `none`,
				}),
		  }
		: {
				position: `relative`,
				width: `100%`,
				height: gridArea === 'arrow' ? `36px` : `100%`,
				gridArea,
		  };
}
</script>

<template>
	<div>
		<!-- Tab view -->
		<AppNavTabList v-if="useTabView">
			<ul>
				<li v-for="tab in availableTabs" :key="tab">
					<a :class="{ active: currentSection === tab }" @click="currentSection = tab">
						{{ getSectionLabel(tab) }}
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
					<AppShopProductDiffCard v-if="diffData.hasBefore || useTabView">
						<template v-if="!useTabView" #header>
							{{ getSectionLabel('before') }}
						</template>

						<template v-if="baseModel && baseModel.was_approved" #status>
							<AppShopProductDiffState
								:resource="resource"
								:item-states="currentStates"
							/>
						</template>

						<template v-if="!isInstance(baseModel, StickerModel)" #controls>
							<AppButton
								:disabled="diffData.hasChange"
								solid
								:primary="!currentStates.published"
								@click="setProductPublishState(!currentStates.published)"
							>
								<template v-if="currentStates.published">
									{{ $gettext(`Unpublish`) }}
								</template>
								<template v-else>
									{{ $gettext(`Publish`) }}
								</template>
							</AppButton>

							<div
								v-if="diffData.hasChange"
								v-app-tooltip.touchable="
									$gettext(`You must save your changes first.`)
								"
								:style="{
									...styleAbsoluteFill(),
									cursor: `not-allowed`,
								}"
							/>
						</template>

						<template #default>
							<AppShopProductDiffImg
								:resource="resource"
								:model="baseModel"
								:form="data"
								:img-url="existingImgUrl || undefined"
								:style="{ marginBottom: `16px` }"
							/>
							<AppShopProductDiffMeta
								:current="{
									name: initialFormModel.name,
									...getExtraDiffData(initialFormModel),
								}"
							/>
						</template>
					</AppShopProductDiffCard>
				</Transition>
			</div>

			<div v-if="!useTabView" :style="getDiffContainerStyles('arrow')">
				<!-- Diff arrow -->
				<Transition name="fade">
					<AppJolticon
						v-if="diffData.hasChange"
						icon="arrow-right"
						:style="{
							margin: 0,
							fontSize: `24px`,
							justifySelf: `center`,
							alignSelf: `center`,
						}"
					/>
				</Transition>
			</div>

			<div :style="getDiffContainerStyles('after')">
				<!-- After -->
				<Transition name="fade">
					<AppShopProductDiffCard v-if="diffData.hasAfter || useTabView">
						<template v-if="!useTabView" #header>
							{{ getSectionLabel('after') }}
						</template>

						<template #status>
							<template v-if="diffData.hasChange || !changeRequest">
								<div class="text-center" :style="{ fontWeight: `bold` }">
									{{ $gettext(`Preview`) }}
								</div>
							</template>
							<template v-else>
								<AppShopProductDiffState
									:resource="resource"
									:item-states="changeStates"
								/>
							</template>
						</template>

						<template v-if="!diffData.hasChange && changeRequest" #controls>
							<!-- Cancel pending changes -->
							<AppButton
								:style="{ marginLeft: `auto` }"
								solid
								@click="cancelChangeRequest()"
							>
								{{
									baseModel?.was_approved
										? $gettext(`Cancel changes`)
										: $gettext(`Delete product`)
								}}
							</AppButton>
						</template>

						<template #default>
							<AppShopProductDiffImg
								:resource="resource"
								:model="baseModel"
								:form="data"
								:img-url="tempImgUrl || undefined"
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
						</template>
					</AppShopProductDiffCard>
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
