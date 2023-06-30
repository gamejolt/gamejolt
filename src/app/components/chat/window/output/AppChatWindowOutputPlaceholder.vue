<script lang="ts" setup>
import { kThemeBg, kThemeBgSubtle } from '../../../../../_common/theme/variables';
import { styleBorderRadiusLg } from '../../../../../_styles/mixins';
import { kChatRoomWindowPadding } from '../../../../styles/variables';
import { ChatWindowAvatarSize, ChatWindowLeftGutterSize } from '../variables';
</script>

<template>
	<div
		:style="{
			padding: kChatRoomWindowPadding,
		}"
	>
		<div
			:style="{
				position: `relative`,
				marginBottom: `4px`,
			}"
		>
			<div
				:style="{
					position: `absolute`,
					left: 0,
					bottom: 0,
					width: ChatWindowAvatarSize.px,
					height: ChatWindowAvatarSize.px,
					borderRadius: `50%`,
					backgroundColor: kThemeBgSubtle,
				}"
			/>
			<div
				class="elevate-1"
				:style="{
					...styleBorderRadiusLg,
					marginLeft: ChatWindowLeftGutterSize.px,
					backgroundColor: kThemeBg,
					maxWidth: `100%`,
					width: `300px`,
					height: `50px`,
				}"
			/>
		</div>
	</div>
</template>
