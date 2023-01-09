<script lang="ts" setup>
import { computed, nextTick, PropType, ref, Ref, StyleValue, toRefs, watch } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { Screen } from '../../screen/screen-service';
import AppTheme from '../../theme/AppTheme.vue';
import { $gettext } from '../../translate/translate.service';

type ConfirmWrapperStage = 'hidden' | 'initial' | 'confirm';

const props = defineProps({
	disabled: {
		type: Boolean,
	},
	overlayRadius: {
		type: [Number, String],
		default: undefined,
	},
	overlayStyle: {
		type: [Object, Array] as PropType<StyleValue>,
		default: undefined,
	},
	initialText: {
		type: String,
		default: () => $gettext('Get'),
	},
});

const emit = defineEmits({
	confirm: () => true,
});

const { disabled, overlayRadius, overlayStyle, initialText } = toRefs(props);

const root = ref<HTMLDivElement>() as Ref<HTMLDivElement>;

const stage = ref<ConfirmWrapperStage>('hidden');

/**
 * Used so we can maintain message state while hiding our overlays.
 */
const prevStage = ref<ConfirmWrapperStage>('hidden');

const displayStage = computed(() => {
	if (stage.value === 'hidden') {
		return prevStage.value;
	}
	return stage.value;
});

const effectiveOverlayRadius = computed(() => {
	const radius = overlayRadius?.value;
	if (!radius) {
		return;
	}
	if (typeof radius === 'number' || Number.parseFloat(radius)) {
		return `${radius}px`;
	}
	return radius;
});

const confirmOverlayStyle = computed(() => {
	const result: StyleValue = [];
	if (overlayStyle?.value) {
		result.push(overlayStyle.value);
	}
	return result;
});

watch(disabled, isDisabled => {
	if (isDisabled) {
		setStage('hidden');
	}
});

watch(
	() => Screen.isPointerMouse,
	isMouse => {
		if (isMouse) {
			root.value.blur();
		}
	}
);

function setStage(newStage: ConfirmWrapperStage) {
	if (newStage === stage.value) {
		return;
	}

	prevStage.value = stage.value;
	stage.value = newStage;

	if (newStage === 'hidden') {
		root.value.blur();
	}
}

function onClickWrapper() {
	if (stage.value === 'hidden') {
		showWrapperInitial();
	} else if (stage.value === 'initial') {
		setStage('confirm');
	}
}

async function showWrapperInitial() {
	if (disabled.value) {
		return;
	}

	if (prevStage.value !== 'hidden') {
		// Reset our prevStage to hidden so we display the correct state when
		// fading in.
		prevStage.value = 'hidden';
		await nextTick();
	}
	setStage('initial');
}

function hideWrapper() {
	setStage('hidden');
}

function onConfirm() {
	setStage('hidden');
	emit('confirm');
}
</script>

<template>
	<div
		ref="root"
		class="popper-confirm-wrapper"
		:class="{ '-clickable': !disabled }"
		:tabindex="Screen.isPointerMouse ? undefined : -1"
		@click="onClickWrapper"
		@mouseenter="showWrapperInitial"
		@mouseleave="hideWrapper"
		@focus="showWrapperInitial"
		@blur="hideWrapper"
	>
		<div class="-popper-confirm-child">
			<slot />
		</div>

		<AppTheme
			class="-confirm-overlay"
			:class="{ '-fade-out': stage === 'hidden' }"
			force-dark
			:style="confirmOverlayStyle"
		>
			<div
				class="-fade"
				:style="{
					borderRadius: effectiveOverlayRadius,
				}"
			/>

			<template v-if="displayStage !== 'hidden'">
				<div
					class="-message -button-like -primary"
					:class="{ '-clickable': stage === 'initial' }"
				>
					<span class="-message-contents">
						<template v-if="displayStage === 'initial'">
							{{ initialText }}
						</template>
						<template v-else-if="displayStage === 'confirm'">
							{{ $gettext(`Are you sure?`) }}
						</template>
					</span>
				</div>
			</template>

			<template v-if="displayStage !== 'hidden'">
				<div class="-confirm-buttons" :class="{ '-shrink': displayStage !== 'confirm' }">
					<div class="-confirm-buttons-inner">
						<div class="-button-like -primary" @click.stop="onConfirm()">
							<AppJolticon icon="check" />
						</div>

						<div class="-button-like -reject" @click.stop="setStage('hidden')">
							<AppJolticon icon="remove" />
						</div>
					</div>
				</div>
			</template>
		</AppTheme>
	</div>
</template>

<style lang="stylus" scoped>
$-z-index-child = 1
$-z-index-message-out = 2
$-z-index-message = 3

.popper-confirm-wrapper
	position: relative

.-popper-confirm-child
	z-index: 1

.-clickable
	cursor: pointer

.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
	position: absolute
	z-index: $-z-index-message-out

.-confirm-overlay
.-fade
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-confirm-overlay
	user-select: none
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	transition: opacity 400ms $strong-ease-out
	z-index: 2

.-fade
	background-color: rgba($black, 0.54)
	z-index: -1

.-spacer
	height: 12px
	flex: 0 1 12px

.-fade-out
	opacity: 0
	pointer-events: none

.-message
	rounded-corners-sm()
	overflow: hidden

.-message-contents
	z-index: $-z-index-message

.-confirm-buttons
	flex-grow: 0
	flex-shrink: 1
	flex-basis: 24px
	margin-top: 4px
	height: 24px
	opacity: 1
	transition: all 400ms, opacity 200ms

	&.-shrink
		flex-basis: 0
		margin-top: 0
		height: 0
		opacity: 0

.-confirm-buttons-inner
	rounded-corners-sm()
	overflow: hidden
	display: inline-flex

.-button-like
	padding: 2px 6px
	text-align: center
	cursor: pointer
	font-weight: bold

	&
	::v-deep(.jolticon)
		font-size: $font-size-small

	&.-primary
		change-bg(primary)
		theme-prop('color', 'primary-fg')

	&.-reject
		background-color: $gj-overlay-notice
		color: $white
</style>
