<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import AppJoltydexUser from '~app/components/shell/sidebar/_joltydex/AppJoltydexUser.vue';
import { showVendingMachineModal } from '~app/components/vending-machine/modal/modal.service';
import { useAppStore } from '~app/store';
import { useJoltydexStore } from '~app/store/joltydex';
import { trackJoltydex } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import { useEscapeStack } from '~common/escape-stack/escape-stack.service';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illJoltydexBrowse } from '~common/illustration/illustrations';
import AppLoading from '~common/loading/AppLoading.vue';
import { Screen } from '~common/screen/screen-service';
import { useCommonStore } from '~common/store/common-store';
import { kThemeBgActual } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import { kFontSizeLarge } from '~styles/variables';
import { fuzzysearch } from '~utils/string';

const { user: loggedInUser } = useCommonStore();
const { toggleLeftPane } = useAppStore();
const { selectedJoltydexUser } = useJoltydexStore();

const isLoading = ref(true);
const users = ref<UserModel[]>([]);
const filter = ref('');

const filteredUsers = computed(() => {
	const f = filter.value.trim().toLowerCase();
	const normalizedUserData = users.value.map(user => {
		return {
			user,
			username: user.username.toLowerCase(),
			displayName: user.display_name.toLowerCase(),
		};
	});

	const result: UserModel[] = [];
	for (const data of normalizedUserData) {
		if (fuzzysearch(f, data.username) || fuzzysearch(f, data.displayName)) {
			result.push(data.user);
		}
	}
	return result;
});

onMounted(() => {
	trackJoltydex({ action: 'show' });
});

// This sidebar might show before the user is loaded in, so just wait till they
// are before trying to initialize.
watch(
	loggedInUser,
	() => {
		if (loggedInUser.value) {
			loadUsers();
		}
	},
	{ immediate: true }
);

useEscapeStack(() => {
	const hadWindow = !!selectedJoltydexUser.value;
	// Clear out the [activeQuest], closing the quest window.
	selectedJoltydexUser.value = undefined;

	// Mobile sizes should close the quest window before closing the sidebar.
	// Desktop should close the sidebar always.
	if (!hadWindow || Screen.isDesktop) {
		toggleLeftPane('');
	}
});

async function loadUsers() {
	const response = await Api.sendFieldsRequest(
		'/mobile/inventory-collection',
		{
			users: {
				user: loggedInUser.value!.id,
			},
		},
		{ detach: true }
	);

	users.value = UserModel.populate(response.users);

	isLoading.value = false;
}
</script>

<template>
	<div id="shell-sidebar-joltydex" class="fill-offset">
		<div
			:style="{
				padding: `var(--shell-content-sidebar-padding)`,
			}"
		>
			<AppIllustration :asset="illJoltydexBrowse" />

			<template v-if="isLoading">
				<AppLoading centered />
			</template>
			<template v-if="users.length">
				<div
					:style="{
						fontSize: kFontSizeLarge.px,
						fontWeight: `bold`,
						marginBottom: `8px`,
					}"
				>
					{{ $gettext(`Which collection would you like to browse?`) }}
				</div>

				<div
					v-if="users.length > 5"
					:style="{
						position: `sticky`,
						// Put it on its own layer so that when it stickies it
						// doesn't repaint every time.
						willChange: `transform`,
						top: `0`,
						padding: `8px var(--shell-content-sidebar-padding)`,
						margin: `0 calc(0px - var(--shell-content-sidebar-padding))`,
						zIndex: 2,
						backgroundColor: kThemeBgActual,
					}"
				>
					<input
						v-model="filter"
						class="form-control"
						:placeholder="$gettext(`Filter...`)"
					/>
				</div>

				<template v-if="filteredUsers.length">
					<AppJoltydexUser v-for="user of filteredUsers" :key="user.id" :user="user" />
				</template>
				<template v-else>
					<div class="alert alert-info">
						{{ $gettext(`No results for that filter.`) }}
					</div>
				</template>
			</template>
			<template v-else-if="!isLoading && !users.length">
				<div class="alert alert-info">
					<div>
						{{
							$gettext(
								`Your Joltydex allows you to browse all your collectibles in one place. That is, once you have some.`
							)
						}}
					</div>
					<br />
					<div>
						<a @click="showVendingMachineModal({ location: 'joltydex' })">
							{{ $gettext(`Get some cool stuff from the Shop!`) }}
						</a>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
