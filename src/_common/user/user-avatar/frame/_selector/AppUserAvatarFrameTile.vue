<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRef, toRefs } from 'vue';
import {
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleLineClamp,
} from '../../../../../_styles/mixins';
import { kBorderWidthLg, kFontSizeSmall, kStrongEaseOut } from '../../../../../_styles/variables';
import AppAspectRatio from '../../../../aspect-ratio/AppAspectRatio.vue';
import AppAvatarFrame from '../../../../avatar/AppAvatarFrame.vue';
import { shorthandReadableTime } from '../../../../filters/duration';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import {
	kThemeBgOffset,
	kThemeBgSubtle,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../../theme/variables';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
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
	isRandom: {
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

const name = toRef(() => frame?.value?.avatar_frame.name || '');

const rootStyles = computed(() => {
	return {
		...styleBorderRadiusLg,
		position: `relative`,
		padding: `24px`,
		transition: `background-color 300ms ${kStrongEaseOut}`,
		border: `${kBorderWidthLg.px} solid ${kThemeFg10}`,
		...(isPlaceholder.value
			? {
					backgroundColor: kThemeBgSubtle,
			  }
			: {
					cursor: frame?.value?.isExpired ? 'normal' : 'pointer',
					backgroundColor: isSelected.value ? kThemeBgOffset : `transparent`,
			  }),
	} satisfies CSSProperties;
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
	<div>
		<div :style="rootStyles" @click="onClickFrame">
			<!-- Clickable avatar frame tile -->
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
							<template v-if="isRandom">
								<AppJolticon big icon="other-os" />
								{{ $gettext(`Random`) }}
							</template>
							<template v-else>
								{{ $gettext(`No frame`) }}
							</template>
						</div>
						<AppAvatarFrame v-else :frame="frame.avatar_frame">
							<AppAspectRatio :ratio="1">
								<slot name="selected-avatar" />
							</AppAspectRatio>
						</AppAvatarFrame>
					</div>
				</template>
			</AppAspectRatio>

			<!-- Floating expiry info -->
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

		<!-- Name -->
		<div
			v-if="name.length"
			v-app-tooltip="name.length > 30 ? name : undefined"
			:style="{
				fontSize: kFontSizeSmall.px,
				fontWeight: `600`,
				...styleLineClamp(2),
			}"
		>
			{{ name }}
		</div>
	</div>
</template>
