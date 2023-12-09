<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppCard from '../card/AppCard.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { $gettext } from '../translate/translate.service';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountPlatformIcon,
	getLinkedAccountProviderDisplayName,
} from './linked-account.model';

const props = defineProps({
	provider: {
		type: String as PropType<LinkedAccountProvider>,
		required: true,
	},
	account: {
		type: Object as PropType<LinkedAccountModel | null>,
		default: null,
	},
	preview: {
		type: Boolean,
	},
	spanWidth: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	sync: (_provider: string) => true,
	unlink: (_provider: string) => true,
	link: (_provider: string) => true,
});

const { account, provider } = toRefs(props);

const actualProvider = toRef(() => (account.value ? account.value.provider : provider.value));

const providerIcon = computed(() => {
	const provider = actualProvider.value;
	return getLinkedAccountPlatformIcon(provider);
});

const providerName = computed(() => {
	const provider = actualProvider.value;
	return getLinkedAccountProviderDisplayName(provider);
});

const platformLink = toRef(() => {
	if (account.value) {
		return account.value.platformLink;
	}
	return undefined;
});

const isAccountSet = toRef(() => {
	return !!account.value && account.value.provider_id && account.value.name;
});

function onSync() {
	emit('sync', actualProvider.value);
}

function onUnlink() {
	emit('unlink', actualProvider.value);
}

function onLink() {
	emit('link', actualProvider.value);
}
</script>

<template>
	<AppCard>
		<div class="-icon">
			<AppJolticon big :icon="providerIcon" />
		</div>

		<div class="-body">
			<h5>
				{{ providerName }}
			</h5>

			<template v-if="!isAccountSet">
				<p>
					<small class="text-muted">
						{{ $gettext(`Not linked.`) }}
					</small>
				</p>

				<AppButton
					v-if="!preview"
					primary
					:disabled="disabled"
					icon="link"
					@click="onLink()"
				>
					{{ $gettext(`Link Now`) }}
				</AppButton>
			</template>
			<template v-else>
				<p>
					<strong v-if="platformLink">
						<a :href="platformLink" target="_blank">
							{{ account.name }}
						</a>
					</strong>
					<span v-else>
						{{ account.name }}
					</span>
				</p>

				<div v-if="!preview">
					<AppButton :disabled="disabled" @click="onSync()">
						{{ $gettext(`Sync`) }}
					</AppButton>
					<AppButton trans :disabled="disabled" @click="onUnlink()">
						{{ $gettext(`Unlink`) }}
					</AppButton>
				</div>
			</template>

			<slot />
		</div>
	</AppCard>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px

	> h5
		margin: 0
		font-weight: bold
</style>
