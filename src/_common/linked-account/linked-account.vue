<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../card/AppCard.vue';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountPlatformIcon,
	getLinkedAccountProviderDisplayName,
} from './linked-account.model';

@Options({
	components: { AppCard },
})
export default class AppLinkedAccount extends Vue {
	@Prop(Object)
	account!: LinkedAccountModel | null;

	@Prop(String)
	provider!: LinkedAccountProvider;

	@Prop(Boolean)
	preview?: boolean;

	@Prop(Boolean)
	spanWidth?: boolean;

	@Prop(Boolean)
	disabled?: boolean;

	get providerIcon() {
		const provider = this.getProvider();
		return getLinkedAccountPlatformIcon(provider);
	}

	get providerName() {
		const provider = this.getProvider();
		return getLinkedAccountProviderDisplayName(provider);
	}

	get platformLink() {
		if (this.account) {
			return this.account.platformLink;
		}
		return undefined;
	}

	get isAccountSet() {
		return !!this.account && this.account.provider_id && this.account.name;
	}

	private getProvider() {
		return this.account ? this.account.provider : this.provider;
	}

	@Emit('sync')
	emitSync(_provider: string) {}

	@Emit('unlink')
	emitUnlink(_provider: string) {}

	@Emit('link')
	emitLink(_provider: string) {}

	onSync() {
		this.emitSync(this.getProvider());
	}

	onUnlink() {
		this.emitUnlink(this.getProvider());
	}

	onLink() {
		this.emitLink(this.getProvider());
	}
}
</script>

<template>
	<AppCard>
		<div class="-icon">
			<AppJolticon big :icon="providerIcon" />
		</div>

		<div class="-body">
			<h5>
				<AppTranslate>{{ providerName }}</AppTranslate>
			</h5>

			<template v-if="!isAccountSet">
				<p>
					<small class="text-muted">
						<AppTranslate>Not linked.</AppTranslate>
					</small>
				</p>

				<AppButton
					v-if="!preview"
					primary
					:disabled="disabled"
					icon="link"
					@click="onLink()"
				>
					<AppTranslate>Link Now</AppTranslate>
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
						<AppTranslate>Sync</AppTranslate>
					</AppButton>
					<AppButton trans :disabled="disabled" @click="onUnlink()">
						<AppTranslate>Unlink</AppTranslate>
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
