<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import { styleBorderRadiusBase, styleBorderRadiusLg } from '../../../../../_styles/mixins';
import { kBorderWidthLg, kFontSizeSmall, kStrongEaseOut } from '../../../../../_styles/variables';
import AppAspectRatio from '../../../../aspect-ratio/AppAspectRatio.vue';
import AppAvatarFrame from '../../../../avatar/AppAvatarFrame.vue';
import { shorthandReadableTime } from '../../../../filters/duration';
import {
	kThemeBgOffset,
	kThemeBgSubtle,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../../theme/variables';
import { UserAvatarFrameModel } from '../frame.model';

const props = defineProps({
	frame: {
		type: Object as PropType<UserAvatarFrameModel>,
		default: undefined,
	},
	isPlaceholder: {
		type: Boolean,
	},
	isSelected: {
		type: Boolean,
	},
	/**
	 * Used as a key to rebuild the expiry info.
	 */
	expiryInfoKey: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	'select-tile': (id: number) => id >= 0,
});

const { frame, isPlaceholder, isSelected } = toRefs(props);

const rootStyles = computed(() => {
	let result: CSSProperties = {
		...styleBorderRadiusLg,
		position: `relative`,
		padding: `24px`,
		transition: `background-color 300ms ${kStrongEaseOut}`,
		border: `${kBorderWidthLg.px} solid ${kThemeFg10}`,
	};

	if (isPlaceholder.value) {
		result = {
			...result,
			backgroundColor: kThemeBgSubtle,
		};
	} else {
		result = {
			...result,
			cursor: frame?.value?.isExpired ? 'normal' : 'pointer',
			backgroundColor: isSelected.value ? kThemeBgOffset : `transparent`,
		};
	}

	return result;
});

function onClickFrame() {
	if (isPlaceholder.value || frame?.value?.isExpired) {
		return;
	}

	emit('select-tile', frame?.value?.avatar_frame.id || 0);
}
</script>

<template>
	<!-- AppUserAvatarFrameTile -->
	<div :style="rootStyles" @click="onClickFrame">
		<AppAspectRatio
			:style="{
				width: `100%`,
			}"
			:ratio="1"
			show-overflow
		>
			<template v-if="!isPlaceholder">
				<div
					:style="{
						position: `absolute`,
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						display: `grid`,
						alignItems: `center`,
					}"
				>
					<div
						v-if="!frame"
						:style="{
							textAlign: `center`,
							fontWeight: `bold`,
							fontSize: kFontSizeSmall.px,
						}"
					>
						{{ $gettext(`No frame`) }}
					</div>
					<AppAvatarFrame v-else :frame="frame.avatar_frame">
						<AppAspectRatio :ratio="1">
							<slot name="selected-avatar" />
						</AppAspectRatio>
					</AppAvatarFrame>
				</div>
			</template>
		</AppAspectRatio>

		<div
			v-if="frame && frame.expires_on"
			:key="expiryInfoKey"
			:style="{
				...styleBorderRadiusBase,
				position: `absolute`,
				top: `8px`,
				left: `8px`,
				padding: `2px 6px`,
				backgroundColor: `rgba(0, 0, 0, 0.54)`,
				color: frame.isExpired ? kThemeGjOverlayNotice : `white`,
				fontWeight: `bold`,
				fontSize: kFontSizeSmall.px,
				zIndex: 3,
				pointerEvents: `none`,
			}"
		>
			{{
				frame.isExpired
					? $gettext(`Expired`)
					: shorthandReadableTime(frame.expires_on, {
							allowFuture: true,
							precision: 'rough',
							nowText: $gettext(`Expired`),
					  })
			}}
		</div>
	</div>
</template>
