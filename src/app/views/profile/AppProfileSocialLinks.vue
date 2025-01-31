<script lang="ts" setup>
import { computed } from 'vue';
import AppButton from '../../../_common/button/AppButton.vue';
import { Jolticon } from '../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../_common/link/AppLinkExternal.vue';
import { LinkedAccountProvider } from '../../../_common/linked-account/linked-account.model';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useProfileRouteStore } from './RouteProfile.vue';

const { user, linkedAccounts } = useProfileRouteStore()!;

function _getLinkedAccount(provider: LinkedAccountProvider) {
	if (
		user.value &&
		linkedAccounts.value &&
		linkedAccounts.value.some(i => i.provider === provider)
	) {
		const account = linkedAccounts.value.find(i => i.provider === provider);
		if (account) {
			return account;
		}
	}
	return null;
}

const socialLinks = computed(() => {
	const items: { label: string; icon: Jolticon; url: string }[] = [];
	if (!user.value || Screen.isMobile) {
		return items;
	}

	const twitchAccount = _getLinkedAccount(LinkedAccountProvider.Twitch);
	if (twitchAccount) {
		items.push({
			label: twitchAccount.name,
			icon: twitchAccount.icon,
			url: twitchAccount.platformLink,
		});
	}

	if (user.value.web_site) {
		items.push({
			label: $gettext(`Website`),
			icon: 'link',
			url: user.value.web_site,
		});
	}

	return items;
});
</script>

<template>
	<template v-for="link of socialLinks" :key="link.label">
		<AppLinkExternal :href="link.url">
			<AppButton :icon="link.icon" block>
				{{ link.label }}
			</AppButton>
		</AppLinkExternal>

		<AppSpacer vertical :scale="1" />
	</template>
</template>
