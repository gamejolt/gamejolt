<script lang="ts" setup>
import { PropType } from 'vue';
import AppBackgroundFade from '../../../../../_common/background/AppBackgroundFade.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { useOnHover } from '../../../../../_common/on/useOnHover';
import AppTheme from '../../../../../_common/theme/AppTheme.vue';
import { kThemeFg } from '../../../../../_common/theme/variables';
import { UserModel } from '../../../../../_common/user/user.model';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleFlexCenter,
	styleOverlayTextShadow,
	styleTyped,
	styleWhen,
} from '../../../../../_styles/mixins';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

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
				})
			"
			:to="{ name: 'profile.shop' }"
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
					zIndex: 2,
					...styleWhen(!!user.header_media_item, {
						...styleOverlayTextShadow,
					}),
				}"
			>
				<AppJolticon icon="marketplace-filled" :style="{ margin: 0 }" big />

				<h3 :style="{ flex: `auto`, margin: 0 }">
					{{ $gettext(`@%{ username }'s Shop`, { username: user.username }) }}
				</h3>

				<AppButton :force-hover="hovered" :overlay="!!user.header_media_item">
					{{ $gettext(`Open shop`) }}
				</AppButton>
			</div>
		</RouterLink>
	</AppTheme>
</template>
