<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { html as termsTemplate } from '../../../../lib/terms/distribution-agreement/global.md';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../_common/filters/date';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';

const props = defineProps({
	account: {
		type: Object as PropType<UserStripeManagedAccount>,
		default: undefined,
	},
});

const emit = defineEmits({
	accepted: () => true,
});

const { account } = toRefs(props);

const checked = ref(false);
const showAgreement = ref(false);

const hasSigned = computed(() => account?.value && account.value.tos_signed_developer > 0);

const hasSignedOldAgreement = computed(
	() =>
		account?.value &&
		account.value.tos_signed_developer > 0 &&
		account.value.tos_signed_developer !== UserStripeManagedAccount.TERMS_DISTRIBUTION_VERSION
);

const agreementLink = computed(() =>
	hasSignedOldAgreement.value
		? 'https://github.com/gamejolt/terms/blob/001ba00910e8ed03e880a1c0bb7a587c498dfff2/distribution-agreement/global.md'
		: 'https://github.com/gamejolt/terms/blob/6306eabf457f19ae6a642af23e561b3e675aed55/distribution-agreement/global.md'
);

function onAccept() {
	emit('accepted');
	showAgreement.value = false;
}
</script>

<template>
	<fieldset>
		<legend>
			<span
				v-if="hasSigned"
				v-app-tooltip="$gettext(`You have completed this section.`)"
				class="pull-right done-icon"
			>
				<AppJolticon icon="check" big />
			</span>
			<AppTranslate>Developer Distribution Agreement</AppTranslate>
		</legend>

		<template v-if="!hasSigned && !showAgreement">
			<div class="form-group">
				<div class="small">
					<div>
						<AppTranslate>
							If you would like to sell games on the Marketplace, you must accept the
							Distribution Agreement.
						</AppTranslate>
					</div>
					<div>
						<RouterLink class="link-help" :to="{ name: 'landing.marketplace' }">
							<AppTranslate>Learn more</AppTranslate>
						</RouterLink>
					</div>
				</div>
				<br />

				<AppButton primary @click="showAgreement = true">
					<AppTranslate>Show Developer Distribution Agreement</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template v-if="hasSigned">
			<div class="form-group">
				<p class="small">
					<AppTranslate
						:translate-params="{
							date: formatDate(account!.tos_signed_developer_timestamp, 'medium'),
						}"
					>
						You have agreed to our Distribution Agreement on %{ date }.
					</AppTranslate>
					<br />
					<AppLinkExternal :href="agreementLink">
						<AppTranslate>View Distribution Agreement</AppTranslate>
					</AppLinkExternal>
				</p>
			</div>
		</template>

		<template v-if="hasSignedOldAgreement">
			<div class="form-group">
				<div class="alert alert-notice">
					<AppTranslate>
						You have signed an older version of the Distribution Agreement. To continue
						selling your games without disruption, you must accept the new agreement.
					</AppTranslate>
				</div>

				<AppButton v-if="!showAgreement" primary @click="showAgreement = true">
					<AppTranslate>Show New Distribution Agreement</AppTranslate>
				</AppButton>
			</div>
		</template>

		<div v-if="showAgreement" class="form-group">
			<div class="tos-scroller">
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div v-html="termsTemplate" />
			</div>
			<br />

			<div class="checkbox">
				<label>
					<input v-model="checked" type="checkbox" />
					<AppTranslate>
						By checking this box and clicking the button below marked "I Agree," I agree
						that I have read, understand, and agree to be bound by the terms of this
						agreement.
					</AppTranslate>
				</label>
			</div>
			<br />

			<AppButton primary solid :disabled="!checked" @click="onAccept()">
				<AppTranslate>I Agree</AppTranslate>
			</AppButton>
		</div>
	</fieldset>
</template>
