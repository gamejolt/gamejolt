<script lang="ts" setup>
import { computed, CSSProperties, ref, useTemplateRef } from 'vue';
import { RouterLink } from 'vue-router';

import { routeLandingCreators } from '~app/views/landing/creators/creators.route';
import AppAnimChargeOrb from '~common/animation/AppAnimChargeOrb.vue';
import AppAnimElectricity from '~common/animation/AppAnimElectricity.vue';
import { illChargeOrbEmpty } from '~common/animation/slideshow/sheets';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoadingFade from '~common/loading/AppLoadingFade.vue';
import { Screen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppStickerChargeTooltip from '~common/sticker/charge/AppStickerChargeTooltip.vue';
import AppStickerChargeTooltipCaret from '~common/sticker/charge/AppStickerChargeTooltipCaret.vue';
import AppStickerChargeTooltipHandler from '~common/sticker/charge/AppStickerChargeTooltipHandler.vue';
import { useStickerStore } from '~common/sticker/sticker-store';
import AppTranslate from '~common/translate/AppTranslate.vue';

const OrbMaxSize = `28px`;

type Props = {
	elevate?: boolean;
	/**
	 * Move the "Charge" text and "help_circle" jolticon above the card of orbs.
	 */
	headerCharge?: boolean;
	/**
	 * Shows text below the charge card when we're able to charge a sticker.
	 */
	allowFullyChargedText?: boolean;
	paddingH?: number;
	paddingV?: number;
	isLoading?: boolean;
	/**
	 * Passed into the AppSpacer component between the header and the charge
	 * card.
	 */
	headerSpacerHeight?: string;
};
const {
	elevate,
	headerCharge,
	allowFullyChargedText,
	paddingH = 24,
	paddingV = 16,
	isLoading,
	headerSpacerHeight,
} = defineProps<Props>();

const root = useTemplateRef('root');
const helpIcon = useTemplateRef('helpIcon');

const showTooltip = ref(false);

const stickerStore = useStickerStore();
const { currentCharge, chargeLimit, canChargeSticker } = stickerStore;

const gridStyling = computed<CSSProperties>(() => {
	return {
		height: OrbMaxSize,
		gridTemplateColumns: `repeat(${chargeLimit.value}, minmax(0, ${OrbMaxSize}))`,
		alignContent: 'center',
	};
});

const showFullyChargedText = computed(() => allowFullyChargedText && canChargeSticker.value);
</script>

<template>
	<AppStickerChargeTooltipHandler
		trigger="focus"
		:disabled="Screen.isPointerMouse"
		:style="{
			'--padding-v': paddingV + 'px',
			'--padding-h': paddingH + 'px',
		}"
		@show="showTooltip = true"
		@hide="showTooltip = false"
	>
		<div
			ref="root"
			class="sticker-charge-card"
			:class="
				headerCharge
					? {}
					: {
							_elevate: elevate,
							_decorator: true,
						}
			"
		>
			<div class="_content" :class="{ _col: headerCharge }">
				<div :style="{ width: headerCharge ? '100%' : undefined }">
					<AppStickerChargeTooltipHandler
						trigger="hover"
						:disabled="!Screen.isPointerMouse"
						inline
						@show="showTooltip = true"
						@hide="showTooltip = false"
					>
						<component :is="headerCharge ? 'h4' : 'h5'" class="_charge-text">
							<AppTranslate>Charge</AppTranslate>

							<span ref="helpIcon" class="_help-circle-container">
								<AppStickerChargeTooltipCaret :show="showTooltip">
									<AppJolticon icon="help-circle" />
								</AppStickerChargeTooltipCaret>
							</span>
						</component>
					</AppStickerChargeTooltipHandler>

					<RouterLink
						v-if="headerCharge"
						:to="{ name: routeLandingCreators.name }"
						class="link-muted"
						:style="{ float: 'right' }"
					>
						<AppTranslate> Learn more </AppTranslate>
					</RouterLink>
				</div>

				<template v-if="headerCharge">
					<div v-if="headerSpacerHeight" :style="{ height: headerSpacerHeight }" />
					<AppSpacer v-else vertical :scale="4" />
				</template>
				<AppLoadingFade
					:style="{
						width: '100%',
					}"
					:is-loading="isLoading"
				>
					<div
						class="_center-grid"
						:class="
							!headerCharge
								? {}
								: {
										_elevate: elevate,
										_decorator: true,
									}
						"
					>
						<AppAnimElectricity
							class="_orbs"
							:style="gridStyling"
							:disabled="!canChargeSticker"
						>
							<AppAspectRatio v-for="i of chargeLimit" :key="i" :ratio="1">
								<img
									v-if="currentCharge < i"
									class="_orb-empty"
									:src="illChargeOrbEmpty.path"
									draggable="false"
									alt=""
								/>
								<AppAnimChargeOrb v-else class="_abs-fill" use-random-offset />
							</AppAspectRatio>
						</AppAnimElectricity>
					</div>
				</AppLoadingFade>
			</div>

			<div v-if="showFullyChargedText" :class="{ _small: headerCharge }">
				<AppSpacer vertical :scale="4" />

				<span>
					You're fully charged! Support your favorite Game Jolt Creator with a charged
					sticker.
				</span>
			</div>

			<AppStickerChargeTooltip
				v-if="helpIcon"
				:caret-element="helpIcon"
				:width-tracker-element="root"
				:show="showTooltip"
			/>
		</div>
	</AppStickerChargeTooltipHandler>
</template>

<style lang="stylus" scoped>
.sticker-charge-card
	position: relative

._decorator
	rounded-corners-lg()
	change-bg(bg)
	padding: var(--padding-v) var(--padding-h)

	&._elevate
		elevate-1()

._content
	display: inline-flex
	align-items: center

	&._col
		flex-direction: column
		align-items: flex-start
		width: 100%

._charge-text
	margin: 0 24px 0 0
	white-space: nowrap
	display: inline-flex
	align-items: center

	::v-deep(.jolticon)
		font-size: 14px
		margin: 0 0 0 4px
		color: var(--theme-fg-muted)

._abs-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

._orbs
	flex: auto
	display: inline-grid
	gap: 4px
	min-width: 0

._orb-empty
	width: 100%
	height: 100%
	opacity: 0.25
	vertical-align: top

._help-circle-container
	display: inline-flex
	margin-left: 4px

	::v-deep(.jolticon)
		margin: 0

hr
	margin: 16px 0

._center-grid
	display: grid
	justify-content: center
	width: 100%

._small
	&
	::v-deep(.jolticon)
		font-size: $font-size-small
</style>
