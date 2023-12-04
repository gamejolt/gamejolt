<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { trackJoltydex } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { useEscapeStack } from '../../../../_common/escape-stack/escape-stack.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illJoltydexBrowse } from '../../../../_common/illustration/illustrations';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { kThemeBgActual } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { kFontSizeLarge } from '../../../../_styles/variables';
import { fuzzysearch } from '../../../../utils/string';
import { useAppStore } from '../../../store';
import { useJoltydexStore } from '../../../store/joltydex';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';
import AppJoltydexUser from './_joltydex/AppJoltydexUser.vue';

const { user: loggedInUser } = useCommonStore();
const { toggleLeftPane } = useAppStore();
const { selectedJoltydexUser } = useJoltydexStore();

const isLoading = ref(true);
const users = ref<UserModel[]>([]);
const filter = ref('');

const filteredUsers = computed(() => {
	const f = filter.value;
	return users.value.filter(i => fuzzysearch(f, i.username.toLowerCase()));
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
