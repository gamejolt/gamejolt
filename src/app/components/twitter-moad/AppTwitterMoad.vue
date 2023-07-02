<script lang="ts" setup>
import AppButton from '../../../_common/button/AppButton.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../../_common/illustration/illustrations';
import { SettingTwitterMoad } from '../../../_common/settings/settings.service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
</script>

<template>
	<div>
		<AppIllustration :asset="illExtremeSadness">
			{{ $gettext(`Rate limit exceeded.`) }}
			<br />
			{{ $gettext(`Touch grass or something lmao`) }}

			<AppSpacer vertical :scale="2" />

			<AppButton primary @click="SettingTwitterMoad.set(false)">
				{{ $gettext(`Disable Twitter Experience?`) }}
			</AppButton>
		</AppIllustration>
	</div>
</template>

<style lang="stylus" scoped></style>
