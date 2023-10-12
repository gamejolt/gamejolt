<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
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
	account: {
		type: Object as PropType<LinkedAccountModel>,
		default: null,
	},
	provider: {
		type: String as PropType<LinkedAccountProvider>,
		required: true,
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

const providerIcon = computed(() => {
	const provider = getProvider();
	return getLinkedAccountPlatformIcon(provider);
});

//TODO(component-setup-refactor): Used in template, but not in script
const providerName = computed(() => {
	const provider = getProvider();
	return getLinkedAccountProviderDisplayName(provider);
});

const platformLink = computed(() => {
	if (account.value) {
		return account.value.platformLink;
	}
	return undefined;
});

const isAccountSet = computed(() => {
	return !!account.value && account.value.provider_id && account.value.name;
});

function getProvider() {
	return account.value ? account.value.provider : provider.value;
}

function onSync() {
	emit('sync', getProvider());
}

function onUnlink() {
	emit('unlink', getProvider());
}

function onLink() {
	emit('link', getProvider());
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
