<script lang="ts" setup>
import { computed, ref } from 'vue';

import { RealmFollowSource } from '~common/analytics/analytics.service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { $toggleRealmFollow, RealmModel } from '~common/realm/realm-model';
import { useCommonStore } from '~common/store/common-store';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	realm: RealmModel;
	source: RealmFollowSource;
	block?: boolean;
	overlay?: boolean;
	forceHover?: boolean;
	disabled?: boolean;
};
const { realm, source, disabled } = defineProps<Props>();
const { user } = useCommonStore();

const isProcessing = ref(false);

const isDisabled = computed(() => disabled || isProcessing.value);

async function onClick() {
	if (!user.value || isDisabled.value) {
		return;
	}

	isProcessing.value = true;
	await $toggleRealmFollow(realm, source);
	isProcessing.value = false;
}
</script>

<template>
	<AppButton
		v-app-auth-required
		primary
		:block="block"
		:overlay="overlay"
		:solid="realm.is_following"
		:disabled="isDisabled"
		:force-hover="forceHover"
		@click="onClick"
	>
		<template v-if="!realm.is_following">
			<AppTranslate>Follow</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Following</AppTranslate>
		</template>
	</AppButton>
</template>
