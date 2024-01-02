<script lang="ts" setup>
import AppButton from '../../../_common/button/AppButton.vue';
import AppLinkExternal from '../../../_common/link/AppLinkExternal.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { useProfileRouteStore } from './RouteProfile.vue';

const { socialLinks } = useProfileRouteStore()!;
</script>

<template>
	<template v-if="socialLinks.length">
		<template v-for="link of socialLinks" :key="link.label">
			<AppLinkExternal :href="link.url">
				<AppButton :icon="link.icon" block>
					{{ link.label }}
				</AppButton>
			</AppLinkExternal>

			<AppSpacer vertical :scale="1" />
		</template>
	</template>
</template>
