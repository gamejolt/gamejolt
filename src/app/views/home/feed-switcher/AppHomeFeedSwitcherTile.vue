<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../../../../_common/media-item/media-item-model';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import {
	kThemeBgSubtle,
	kThemeBiBg,
	kThemeBiFg,
	kThemeDark,
	kThemeFg,
	kThemePrimary,
} from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	styleFlexCenter,
	styleLineClamp,
	styleOverlayTextShadow,
	styleWhen,
} from '../../../../_styles/mixins';
import {
	CSSPixelValue,
	kBorderRadiusBase,
	kBorderRadiusLg,
	kBorderWidthLg,
	kFontSizeTiny,
	kStrongEaseOut,
} from '../../../../_styles/variables';

const props = defineProps({
	to: {
		type: Object as PropType<RouteLocationRaw>,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	mediaItem: {
		type: Object as PropType<MediaItemModel>,
		default: undefined,
	},
	icon: {
		type: String as PropType<Jolticon>,
		default: undefined,
	},
	isActive: {
		type: Boolean,
	},
	fontSize: {
		type: Number,
		default: kFontSizeTiny.value,
	},
	lineHeight: {
		type: Number,
		default: 1,
	},
	collapse: {
		type: Boolean,
	},
	hasTooltip: {
		type: Boolean,
	},
});

const { to, title, mediaItem, icon, isActive, fontSize, lineHeight, collapse } = toRefs(props);

const tileSize = computed(() => {
	if (Screen.isXs) {
		return 80;
	}

	return 100;
});

const maxLines = 2;
const collapsedHeight = computed(() => {
	return fontSize.value * lineHeight.value * maxLines + imagePadding.top + imagePadding.bottom;
});

const imagePadding = {
	top: 4,
	bottom: 4,
	left: 4,
	right: 4,
};

const activeIndicatorSize = kBorderWidthLg.value;
const activeIndicatorMargin = activeIndicatorSize * 2;

const borderRadius = computed<{ backdrop: 'lg' | 'md'; media: CSSPixelValue }>(() => {
	if (collapse.value) {
		return {
			backdrop: 'md',
			media: kBorderRadiusBase,
		};
	}

	return {
		backdrop: 'lg',
		media: kBorderRadiusLg,
	};
});

function getImageFilters({ hovered }: { hovered: boolean }) {
	const grayscale = hovered || isActive.value ? 0 : 0.8;
	let filter = `grayscale(${grayscale})`;
	if (collapse.value) {
		filter += ` blur(2px) brightness(0.7)`;
	}
	return filter;
}
</script>

<template>
	<!-- AppHomeFeedSwitcherTile -->
	<div
		v-app-tooltip="hasTooltip ? title : undefined"
		:style="{
			alignSelf: `stretch`,
			...styleWhen(collapse, {
				marginBottom: activeIndicatorMargin + `px`,
			}),
		}"
	>
		<RouterLink
			class="link-unstyled"
			:to="to"
			:style="{
				textDecoration: `none !important`,
			}"
		>
			<AppOnHover :state-key="collapse ? 1 : -1" :disable="!Screen.isPointerMouse">
				<template #default="{ binding, hovered }">
					<div
						v-bind="binding"
						:style="{
							position: `relative`,
							display: `flex`,
							width: `${tileSize}px`,
							flexFlow: `column nowrap`,
							alignItems: `center`,
							...styleWhen(collapse, {
								justifyContent: `center`,
							}),
						}"
					>
						<div
							:style="{
								...styleFlexCenter({ direction: 'row' }),
								position: `relative`,
								width: `${tileSize}px`,
								height: `${tileSize}px`,
								...styleWhen(collapse, {
									height: `${collapsedHeight}px`,
								}),
							}"
						>
							<AppMediaItemBackdrop
								:media-item="mediaItem"
								:radius="borderRadius.backdrop"
								:fallback-color="
									hovered || isActive
										? kThemeBiBg
										: collapse
										? kThemeDark
										: kThemeBgSubtle
								"
							>
								<AppImgResponsive
									v-if="mediaItem"
									:src="mediaItem.mediaserver_url"
									:style="{
										position: `absolute`,
										width: `100%`,
										height: `100%`,
										objectFit: `cover`,
										transition: `filter 300ms ${kStrongEaseOut}`,
										filter: getImageFilters({ hovered }),
									}"
									alt=""
									draggable="false"
									ondragstart="return false"
								/>
							</AppMediaItemBackdrop>

							<AppJolticon
								v-if="icon && !collapse"
								:icon="icon"
								:style="{
									position: `absolute`,
									fontSize: `${tileSize * 0.3}px`,
									margin: 0,
									color: hovered || isActive ? kThemeBiFg : kThemeFg,
									transition: `color 300ms ${kStrongEaseOut}`,
								}"
							/>

							<div
								v-if="isActive"
								:style="{
									position: `absolute`,
									top: `-${activeIndicatorMargin}px`,
									right: `-${activeIndicatorMargin}px`,
									bottom: `-${activeIndicatorMargin}px`,
									left: `-${activeIndicatorMargin}px`,
									border: `${activeIndicatorSize}px solid ${kThemePrimary}`,
									borderRadius: `${
										borderRadius.media.value + activeIndicatorSize
									}px`,
									zIndex: 1,
								}"
							/>
						</div>

						<div
							:style="{
								fontWeight: `bold`,
								fontSize: kFontSizeTiny.px,
								textAlign: `center`,
								maxWidth: `${
									tileSize - (imagePadding.left + imagePadding.right)
								}px`,
								width: `max-content`,
								textDecoration: `none !important`,
								lineHeight: lineHeight,
								paddingTop: `1px`,
								paddingBottom: `1px`,
								...(collapse
									? {
											...styleOverlayTextShadow,
											position: `absolute`,
											color: `white`,
											...styleWhen(!mediaItem && (hovered || isActive), {
												color: kThemeBiFg,
											}),
									  }
									: {
											marginTop: `6px`,
											marginBottom: `2px`,
											color: kThemeFg,
									  }),
								...styleLineClamp(2),
							}"
						>
							{{ title }}
						</div>
					</div>
				</template>
			</AppOnHover>
		</RouterLink>
	</div>
</template>
