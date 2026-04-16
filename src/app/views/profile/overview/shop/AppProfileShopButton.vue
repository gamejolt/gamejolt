<script lang="ts" setup>
import AppBackgroundFade from '~common/background/AppBackgroundFade.vue';
import AppButton from '~common/button/AppButton.vue';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { useOnHover } from '~common/on/useOnHover';
import AppTheme from '~common/theme/AppTheme.vue';
import { kThemeFg, kThemePrimary } from '~common/theme/variables';
import { UserModel } from '~common/user/user.model';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleFlexCenter,
	styleOverlayTextShadow,
	styleTyped,
	styleWhen,
} from '~styles/mixins';
import { kBorderWidthBase } from '~styles/variables';

type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();

const { hoverBinding, hovered } = useOnHover();
</script>

<template>
	<AppTheme :force-dark="!!user.header_media_item">
		<RouterLink
			class="sheet sheet-elevate"
			v-bind="{
				...hoverBinding,
			}"
			:style="
				styleTyped({
					...styleBorderRadiusLg,
					display: `block`,
					position: `relative`,
					overflow: `hidden`,
					border: `${kBorderWidthBase.px} solid ${kThemePrimary}`,
				})
			"
			:to="{
				name: 'profile.shop',
				params: { username: user.username },
			}"
		>
			<!-- Backdrop -->
			<div v-if="user.header_media_item" :style="styleAbsoluteFill({ zIndex: 1 })">
				<AppImgResponsive
					:src="user.header_media_item.mediaserver_url"
					:style="{
						width: `100%`,
						height: `100%`,
						objectFit: `cover`,
						filter: `blur(1.5px)`,
					}"
				/>
				<AppBackgroundFade :fade-opacity="0.3" />
			</div>

			<!-- Content -->
			<div
				:style="{
					...styleFlexCenter({
						gap: `12px`,
					}),
					color: kThemeFg,
					position: `relative`,
					zIndex: 3,
					...styleWhen(!!user.header_media_item, {
						...styleOverlayTextShadow,
					}),
				}"
			>
				<AppJolticon icon="marketplace-filled" :style="{ margin: 0 }" big />

				<h3 :style="{ flex: `auto`, margin: 0 }">
					{{ $gettext(`@%{ username }'s Shop`, { username: user.username }) }}
				</h3>

				<AppButton
					:force-hover="hovered"
					:overlay="!!user.header_media_item"
					:solid="!user.header_media_item"
				>
					{{ $gettext(`Open shop`) }}
				</AppButton>
			</div>
		</RouterLink>
	</AppTheme>
</template>
