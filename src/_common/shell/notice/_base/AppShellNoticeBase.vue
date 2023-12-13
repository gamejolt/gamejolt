<script lang="ts" setup>
import { onMounted, toRefs, watch } from 'vue';
import {
	styleAbsoluteFill,
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleTyped,
	styleWhen,
} from '../../../../_styles/mixins';
import { kBorderWidthBase, kFontSizeLarge, kFontSizeSmall } from '../../../../_styles/variables';
import { sleep } from '../../../../utils/utils';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import { useOnHover } from '../../../on/useOnHover';
import { Screen } from '../../../screen/screen-service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import {
	kThemeBgOffset,
	kThemeFg10,
	kThemeFgMuted,
	kThemeGjOverlayNotice,
} from '../../../theme/variables';
import { $gettext } from '../../../translate/translate.service';
import { getShellNotice } from '../notice.service';

const { remove: removeShellNoticeItem } = getShellNotice();

const props = defineProps({
	noticeId: {
		type: Number,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	/**
	 * Duration to wait before automatically closing.
	 */
	autoCloseMs: {
		type: Number,
		default: undefined,
		validator: val => val === undefined || (typeof val === 'number' && val > 0),
	},
	/**
	 * Duration override for `anim-fade-*` classes.
	 */
	animDurationMs: {
		type: Number,
		default: 500,
	},
});

const { noticeId, message, autoCloseMs, animDurationMs } = toRefs(props);

const { hovered, hoverBinding } = useOnHover();

const emit = defineEmits({
	'show-transition-end': () => true,
});

const leadingSize = 48;
let autoCloseTimeout: NodeJS.Timer | undefined;

// Variables to keep track of auto-close timeout. Used so we can pause the
// animation and timeout when hovered.
const start = Date.now();
let end = start + (autoCloseMs?.value ?? 0);
let timeLeft = end - start;

watch(
	[hovered, () => autoCloseMs?.value],
	([hovered, autoCloseMs]) => {
		if (autoCloseMs === undefined || autoCloseMs <= 0) {
			clearAutoCloseTimeout();
			return;
		}

		if (hovered) {
			clearAutoCloseTimeout();
			timeLeft = end - Date.now();
		} else {
			end = Date.now() + timeLeft;
			autoCloseTimeout ??= setTimeout(() => {
				removeShellNoticeItem(noticeId.value);
			}, timeLeft);
		}
	},
	{ immediate: true }
);

onMounted(async () => {
	await sleep(animDurationMs.value);
	emit('show-transition-end');
});

function clearAutoCloseTimeout() {
	if (autoCloseTimeout) {
		clearTimeout(autoCloseTimeout);
		autoCloseTimeout = undefined;
	}
}

function removeNotice() {
	clearAutoCloseTimeout();
	removeShellNoticeItem(noticeId.value);
}
</script>

<template>
	<div
		v-bind="{ ...hoverBinding }"
		:class="{
			'anim-fade-enter-right anim-fade-leave-right': !Screen.isXs,
			'anim-fade-enter-down anim-back-leave-up': Screen.isXs,
		}"
		:style="
			styleTyped({
				...styleWhen(animDurationMs >= 0, {
					animationDuration: `${animDurationMs}ms`,
				}),
				display: `inline-flex`,
				justifyContent: `flex-end`,
				minWidth: `${Math.min(200, Screen.width - 32)}px`,
				maxWidth: `350px`,
				marginBottom: `4px`,
			})
		"
	>
		<a
			class="fill-offset"
			:style="{
				...styleElevate(2),
				...styleBorderRadiusLg,
				border: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
				borderRight: `none`,
				padding: `8px 12px`,
				display: `flex`,
				alignItems: `center`,
			}"
			@click="removeNotice"
		>
			<div
				:style="{
					...styleBorderRadiusBase,
					height: `${leadingSize - 8}px`,
					width: `8px`,
					background: kThemeBgOffset,
					marginRight: `8px`,
					overflow: `hidden`,
				}"
			>
				<div
					:class="{ '_anim-progress': autoCloseMs }"
					:style="{
						...styleBorderRadiusBase,
						animationDuration: `${autoCloseMs}ms`,
						animationPlayState: hovered ? `paused` : `running`,
						animationFillMode: `both`,
						animationTimingFunction: `linear`,
						width: `100%`,
						height: `100%`,
						background: kThemeGjOverlayNotice,
					}"
				/>
			</div>

			<div
				:style="{
					width: `${leadingSize}px`,
					height: `${leadingSize}px`,
					flex: `none`,
					marginRight: `8px`,
					position: `relative`,
				}"
			>
				<slot name="leading" v-bind="{ size: leadingSize }">
					<div
						class="fill-offset"
						:style="{
							...styleAbsoluteFill(),
							...styleFlexCenter(),
							borderRadius: `50%`,
						}"
					>
						<AppJolticon
							icon="notice"
							:style="{
								margin: 0,
								fontSize: kFontSizeLarge.px,
								color: kThemeFgMuted,
							}"
						/>
					</div>
				</slot>
			</div>

			<div
				:style="{
					flex: `auto`,
				}"
			>
				<div>
					{{ message }}
				</div>

				<div
					:style="{
						color: kThemeFgMuted,
						fontSize: kFontSizeSmall.px,
					}"
				>
					<slot name="subtext">
						{{ $gettext(`Click to dismiss`) }}
					</slot>
				</div>
			</div>

			<AppSpacer horizontal :scale="4" />
		</a>
	</div>
</template>

<style lang="stylus" scoped>
._anim-progress
	animation: anim-progress

@keyframes anim-progress
	0%
		transform: translateY(0%)
	100%
		transform: translateY(100%)
</style>
