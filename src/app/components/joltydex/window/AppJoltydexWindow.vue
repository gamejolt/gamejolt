<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { trackJoltydex } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppJoltydexBrowser from '../../../../_common/joltydex/AppJoltydexBrowser.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { kThemeFgMuted } from '../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../_common/user/user.model';
import { styleTextOverflow } from '../../../../_styles/mixins';
import { kFontSizeLarge, kFontSizeSmall } from '../../../../_styles/variables';
import { useAppStore } from '../../../store/index';
import { useJoltydexStore } from '../../../store/joltydex';
import AppShellWindow from '../../shell/AppShellWindow.vue';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';

const props = defineProps({
	selectedUser: {
		type: UserModel,
		required: true,
	},
});

const { selectedUser } = toRefs(props);
const { selectedJoltydexUser } = useJoltydexStore();
const { toggleLeftPane } = useAppStore();

onMounted(() => {
	trackJoltydex({ action: 'show-collection', collectionId: selectedUser.value.id });
});

onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();

	if (selectedUser.value === selectedJoltydexUser.value) {
		selectedJoltydexUser.value = undefined;
	}
});

let isLoadingSales = false;
const userWithSales = ref<number>();
const hasSale = computed(
	() => !!userWithSales.value && userWithSales.value === selectedUser.value.id
);

watch(
	selectedUser,
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
			if (payload.hasSales && selectedUser.value.id === newUser.id) {
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
	if (Screen.isDesktop) {
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
						:icon="Screen.isXs ? 'marketplace-filled' : undefined"
						:circle="Screen.isXs"
						@click="
							showVendingMachineModal({
								userId: selectedUser.id,
								location: 'joltydex-collection',
							})
						"
					>
						<template v-if="!Screen.isXs">
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
