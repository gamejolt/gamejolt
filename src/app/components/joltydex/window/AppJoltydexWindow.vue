<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import AppShellWindow from '~app/components/shell/AppShellWindow.vue';
import { useAppStore } from '~app/store/index';
import { useJoltydexStore } from '~app/store/joltydex';
import { trackJoltydex } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppHeaderBar from '~common/header/AppHeaderBar.vue';
import { showVendingMachineModal } from '~common/inventory/shop/vending-machine/modal.service';
import AppJoltydexBrowser from '~common/joltydex/AppJoltydexBrowser.vue';
import { getScreen } from '~common/screen/screen-service';
import AppScrollScroller from '~common/scroll/AppScrollScroller.vue';
import { kThemeFgMuted } from '~common/theme/variables';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleTextOverflow } from '~styles/mixins';
import { kFontSizeLarge, kFontSizeSmall } from '~styles/variables';

type Props = {
	selectedUser: UserModel;
};
const { selectedUser } = defineProps<Props>();
const { selectedJoltydexUser } = useJoltydexStore();
const { toggleLeftPane } = useAppStore();
const { isXs, isDesktop } = getScreen();

onMounted(() => {
	trackJoltydex({ action: 'show-collection', collectionId: selectedUser.id });
});

onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();

	if (selectedUser === selectedJoltydexUser.value) {
		selectedJoltydexUser.value = undefined;
	}
});

let isLoadingSales = false;
const userWithSales = ref<number>();
const hasSale = computed(() => !!userWithSales.value && userWithSales.value === selectedUser.id);

watch(
	() => selectedUser,
	async (newUser, oldUser) => {
		if (newUser.id !== oldUser?.id) {
			userWithSales.value = undefined;
		}
		if (!newUser || newUser.id === oldUser?.id || isLoadingSales) {
			return;
		}
		isLoadingSales = true;
		try {
			const payload = await Api.sendFieldsRequest(
				`/mobile/user/${newUser.id}`,
				{
					hasSales: true,
				},
				{ detach: true }
			);
			if (payload.hasSales && selectedUser.id === newUser.id) {
				userWithSales.value = newUser.id;
			}
		} finally {
			isLoadingSales = false;
		}
	},
	{ immediate: true }
);

function close() {
	// Causes the shell to v-if this away.
	selectedJoltydexUser.value = undefined;

	// Close the sidebar only for breakpoints that always show it. Mobile
	// breakpoints have the quest window overlay everything, so we should keep
	// the sidebar open.
	if (isDesktop.value) {
		toggleLeftPane('');
	}
}
</script>

<template>
	<AppShellWindow :close-callback="close" avoid-sidebar="md-up">
		<div
			:style="{
				flex: `auto`,
				display: `flex`,
				flexDirection: `column`,
				zIndex: 1,
				// Needed for AppHeaderBar to collapse.
				minWidth: 0,
			}"
		>
			<AppHeaderBar
				title-size="lg"
				:automatically-imply-leading="false"
				:elevation="2"
				:title-spacing="16"
				:dynamic-slots="{
					leading: true,
					title: true,
					actions: true,
					bottom: false,
				}"
			>
				<template #leading>
					<AppUserAvatarBubble
						:style="{
							width: `36px`,
							height: `36px`,
						}"
						:user="selectedUser"
						show-frame
						show-verified
					/>
				</template>

				<template #title>
					<div
						:style="[
							styleTextOverflow,
							{
								fontSize: kFontSizeLarge.px,
								fontWeight: `bold`,
							},
						]"
					>
						{{
							$gettext(`%{ user }'s Collection`, {
								user: selectedUser.display_name,
							})
						}}
					</div>

					<div
						:style="{
							fontSize: kFontSizeSmall.px,
							lineHeight: 1,
							color: kThemeFgMuted,
						}"
					>
						@{{ selectedUser.username }}
					</div>
				</template>

				<template #actions>
					<AppButton
						v-if="hasSale"
						solid
						primary
						:icon="isXs ? 'marketplace-filled' : undefined"
						:circle="isXs"
						@click="
							showVendingMachineModal({
								userId: selectedUser.id,
								location: 'joltydex-collection',
							})
						"
					>
						<template v-if="!isXs">
							{{ $gettext(`Open shop`) }}
						</template>
					</AppButton>

					<AppButton circle trans sparse icon="remove" @click="close()" />
				</template>
			</AppHeaderBar>

			<div
				:style="{
					position: `relative`,
					overflow: `hidden`,
				}"
			>
				<AppScrollScroller
					:style="{
						height: `100%`,
						padding: `16px`,
					}"
				>
					<AppJoltydexBrowser :user="selectedUser" />
				</AppScrollScroller>
			</div>
		</div>
	</AppShellWindow>
</template>
