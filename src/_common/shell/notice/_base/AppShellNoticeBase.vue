<script lang="ts" setup>
import { onMounted, toRefs, watch } from 'vue';
import {
	styleAbsoluteFill,
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleWhen,
} from '../../../../_styles/mixins';
import { kBorderWidthBase, kFontSizeLarge, kFontSizeSmall } from '../../../../_styles/variables';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import { Screen } from '../../../screen/screen-service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { kThemeFg10, kThemeFgMuted, kThemeGjOverlayNotice } from '../../../theme/variables';
import { $gettext } from '../../../translate/translate.service';
import { ShellNotice } from '../AppShellNotice.vue';

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
		default: undefined,
	},
});

const { noticeId, message, autoCloseMs } = toRefs(props);

const emit = defineEmits({
	'show-transition-end': () => true,
});

let autoCloseTimeout: NodeJS.Timer | undefined;

watch(
	() => autoCloseMs?.value,
	ms => {
		if (ms && !autoCloseTimeout) {
			autoCloseTimeout = setTimeout(() => {
				ShellNotice.remove(noticeId.value);
			}, ms);
		}
	}
);

onMounted(() => {
	if (autoCloseMs?.value) {
		autoCloseTimeout = setTimeout(() => {
			ShellNotice.remove(noticeId.value);
		}, autoCloseMs.value);
	}
});

function onClick() {
	if (autoCloseTimeout) {
		clearTimeout(autoCloseTimeout);
		autoCloseTimeout = undefined;
	}
	ShellNotice.remove(noticeId.value);
}
</script>

<template>
	<div
		:class="{
			'anim-fade-enter-right anim-fade-leave-right': !Screen.isXs,
			'anim-fade-enter-down anim-back-leave-up': Screen.isXs,
		}"
		:style="{
			...styleWhen(!!animDurationMs, {
				animationDuration: `${animDurationMs}ms`,
			}),
			display: `inline-flex`,
			justifyContent: `flex-end`,
			minWidth: `${Math.min(200, Screen.width - 32)}px`,
			maxWidth: `max(350px, 100%)`,
		}"
		@animationend="emit('show-transition-end')"
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
			@click="onClick"
		>
			<div
				:style="{
					...styleBorderRadiusBase,
					height: `40px`,
					width: `8px`,
					background: kThemeGjOverlayNotice,
					marginRight: `8px`,
				}"
			/>

			<div
				:style="{
					width: `48px`,
					height: `48px`,
					flex: `none`,
					marginRight: `8px`,
					position: `relative`,
				}"
			>
				<slot name="leading">
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
