<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRef, toRefs } from 'vue';
import {
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleLineClamp,
	styleWhen,
} from '../../../../../_styles/mixins';
import { kBorderWidthLg, kFontSizeSmall, kStrongEaseOut } from '../../../../../_styles/variables';
import AppAspectRatio from '../../../../aspect-ratio/AppAspectRatio.vue';
import AppAvatarFrame from '../../../../avatar/AppAvatarFrame.vue';
import { shorthandReadableTime } from '../../../../filters/duration';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import AppOnHover from '../../../../on/AppOnHover.vue';
import { Screen } from '../../../../screen/screen-service';
import {
	kThemeBgOffset,
	kThemeBgSubtle,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../../theme/variables';
import { vAppTooltip } from '../../../../tooltip/tooltip-directive';
import { UserAvatarFrameModel, toggleFavorite } from '../frame.model';

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

const canToggleFavorite = toRef(() => !!frame?.value);
const isTogglingFavorite = ref(false);
const shouldAlwaysShowFavorite = toRef(
	() => canToggleFavorite.value && (frame?.value?.is_favorite || !Screen.isPointerMouse)
);

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

async function onClickToggleFavorite() {
	if (!frame?.value) {
		return;
	}
	if (isTogglingFavorite.value) {
		return;
	}

	isTogglingFavorite.value = true;

	// Optimistically set the desired result on the model to immediately reflect change.
	frame.value.is_favorite = !frame.value.is_favorite;

	const response = await toggleFavorite(frame.value);
	// Write the actual correct value to the model after the request concludes.
	if (typeof response.is_favorite === 'boolean') {
		frame.value.is_favorite = response.is_favorite;
	}

	isTogglingFavorite.value = false;
}
</script>

<template>
	<!-- AppUserAvatarFrameTile -->
	<div>
		<AppOnHover v-slot="{ hoverBinding: hoverBindingTile, hovered: hoveredTile }">
			<div
				v-bind="{
					...hoverBindingTile,
					style: [rootStyles],
				}"
				@click="onClickFrame"
			>
				<!-- Clickable avatar frame tile -->
				<AppAspectRatio :style="{ width: `100%` }" :ratio="1" show-overflow>
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
									<div>
										<AppJolticon big icon="shuffle" />
									</div>
									<div>
										{{ $gettext(`Random`) }}
									</div>
								</template>
								<template v-else>
									<div>
										<AppJolticon big icon="remove" />
									</div>
									<div>
										{{ $gettext(`No frame`) }}
									</div>
								</template>
							</div>
							<template v-else>
								<AppOnHover
									v-slot="{
										hoverBinding: hoverBindingIcon,
										hovered: hoveredIcon,
									}"
								>
									<AppJolticon
										v-if="canToggleFavorite"
										v-app-tooltip="
											frame.is_favorite
												? $gettext(`Favorite!`)
												: $gettext(`Mark as favorite`)
										"
										v-bind="{
											...hoverBindingIcon,
											style: [
												{
													display: `none`,
													position: `absolute`,
													top: `-20px`,
													right: `-20px`,
													zIndex: 2,
													filter: `drop-shadow(0 0 4px var(--theme-bg))`,
													transition: `transform 0.1s ease`,
												},
												styleWhen(hoveredIcon && !isTogglingFavorite, {
													transform: `scaleX(1.25) scaleY(1.25)`,
												}),
												styleWhen(isTogglingFavorite, {
													opacity: `0.5`,
												}),
												styleWhen(!isTogglingFavorite, {
													cursor: `pointer`,
												}),
												styleWhen(shouldAlwaysShowFavorite || hoveredTile, {
													display: `block`,
												}),
											],
										}"
										big
										:icon="frame.is_favorite ? `heart-filled` : `heart`"
										:notice="frame.is_favorite"
										@click.stop="onClickToggleFavorite"
									/>
								</AppOnHover>
								<AppAvatarFrame :frame="frame.avatar_frame">
									<AppAspectRatio :ratio="1">
										<slot name="selected-avatar" />
									</AppAspectRatio>
								</AppAvatarFrame>
							</template>
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
		</AppOnHover>

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
