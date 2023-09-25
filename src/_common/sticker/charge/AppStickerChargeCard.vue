<script lang="ts" setup>
import { computed, CSSProperties, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { routeLandingCreators } from '../../../app/views/landing/creators/creators.route';
import AppAnimChargeOrb from '../../animation/AppAnimChargeOrb.vue';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import { illChargeOrbEmpty } from '../../animation/slideshow/sheets';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import { Screen } from '../../screen/screen-service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import { useStickerStore } from '../sticker-store';
import AppStickerChargeTooltip from './AppStickerChargeTooltip.vue';
import AppStickerChargeTooltipCaret from './AppStickerChargeTooltipCaret.vue';
import AppStickerChargeTooltipHandler from './AppStickerChargeTooltipHandler.vue';

const OrbMaxSize = `28px`;

const props = defineProps({
	elevate: {
		type: Boolean,
	},
	/**
	 * Move the "Charge" text and "help_circle" jolticon above the card of orbs.
	 */
	headerCharge: {
		type: Boolean,
	},
	/**
	 * Shows text below the charge card when we're able to charge a sticker.
	 */
	allowFullyChargedText: {
		type: Boolean,
	},
	paddingH: {
		type: Number,
		default: 24,
	},
	paddingV: {
		type: Number,
		default: 16,
	},
	isLoading: {
		type: Boolean,
	},
	/**
	 * Passed into the AppSpacer component between the header and the charge
	 * card.
	 */
	headerSpacerHeight: {
		type: String,
		default: undefined,
	},
});

const { elevate, headerCharge, allowFullyChargedText, paddingH, paddingV } = toRefs(props);

const root = ref<HTMLElement>();
const helpIcon = ref<HTMLElement>();

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

const showFullyChargedText = computed(() => allowFullyChargedText.value && canChargeSticker.value);
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
							'-elevate': elevate,
							'-decorator': true,
					  }
			"
		>
			<div class="-content" :class="{ '-col': headerCharge }">
				<div :style="{ width: headerCharge ? '100%' : undefined }">
					<AppStickerChargeTooltipHandler
						trigger="hover"
						:disabled="!Screen.isPointerMouse"
						inline
						@show="showTooltip = true"
						@hide="showTooltip = false"
					>
						<component :is="headerCharge ? 'h4' : 'h5'" class="-charge-text">
							<AppTranslate>Charge</AppTranslate>

							<span ref="helpIcon" class="-help-circle-container">
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
						class="-center-grid"
						:class="
							!headerCharge
								? {}
								: {
										'-elevate': elevate,
										'-decorator': true,
								  }
						"
					>
						<AppAnimElectricity
							class="-orbs"
							:style="gridStyling"
							:disabled="!canChargeSticker"
						>
							<AppAspectRatio v-for="i of chargeLimit" :key="i" :ratio="1">
								<img
									v-if="currentCharge < i"
									class="-orb-empty"
									:src="illChargeOrbEmpty.path"
									draggable="false"
									alt=""
								/>
								<AppAnimChargeOrb v-else class="-abs-fill" use-random-offset />
							</AppAspectRatio>
						</AppAnimElectricity>
					</div>
				</AppLoadingFade>
			</div>

			<div v-if="showFullyChargedText" :class="{ '-small': headerCharge }">
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

.-decorator
	rounded-corners-lg()
	change-bg(bg)
	padding: var(--padding-v) var(--padding-h)

	&.-elevate
		elevate-1()

.-content
	display: inline-flex
	align-items: center

	&.-col
		flex-direction: column
		align-items: flex-start
		width: 100%

.-charge-text
	margin: 0 24px 0 0
	white-space: nowrap
	display: inline-flex
	align-items: center

	::v-deep(.jolticon)
		font-size: 14px
		margin: 0 0 0 4px
		color: var(--theme-fg-muted)

.-abs-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-orbs
	flex: auto
	display: inline-grid
	gap: 4px
	min-width: 0

.-orb-empty
	width: 100%
	height: 100%
	opacity: 0.25
	vertical-align: top

.-help-circle-container
	display: inline-flex
	margin-left: 4px

	::v-deep(.jolticon)
		margin: 0

hr
	margin: 16px 0

.-center-grid
	display: grid
	justify-content: center
	width: 100%

.-small
	&
	::v-deep(.jolticon)
		font-size: $font-size-small
</style>
