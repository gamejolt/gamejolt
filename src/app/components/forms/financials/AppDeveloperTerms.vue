<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../_common/filters/date';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { UserStripeManagedAccountModel } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { html as termsTemplate } from '../../../../lib/terms/distribution-agreement/global.md';
import AppFinancialsCheckmark from './AppFinancialsCheckmark.vue';
import AppFinancialsTosScroller from './AppFinancialsTosScroller.vue';

const props = defineProps({
	account: {
		type: Object as PropType<UserStripeManagedAccountModel>,
		default: undefined,
	},
});

const emit = defineEmits({
	accepted: () => true,
});

const { account } = toRefs(props);

const checked = ref(false);

const hasSigned = computed(() => account?.value && account.value.tos_signed_developer > 0);

const hasSignedOldAgreement = computed(
	() =>
		account?.value &&
		account.value.tos_signed_developer > 0 &&
		account.value.tos_signed_developer !==
			UserStripeManagedAccountModel.TERMS_DISTRIBUTION_VERSION
);

const agreementLink = computed(() =>
	hasSignedOldAgreement.value
		? 'https://github.com/gamejolt/terms/blob/001ba00910e8ed03e880a1c0bb7a587c498dfff2/distribution-agreement/global.md'
		: 'https://github.com/gamejolt/terms/blob/6306eabf457f19ae6a642af23e561b3e675aed55/distribution-agreement/global.md'
);

function onAccept() {
	emit('accepted');
}
</script>

<template>
	<fieldset>
		<legend>
			<AppFinancialsCheckmark
				v-if="hasSigned"
				:tooltip="$gettext(`You have completed this section.`)"
			/>
			{{ $gettext(`Developer Distribution Agreement`) }}
		</legend>

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
						{{ $gettext(`View Distribution Agreement`) }}
					</AppLinkExternal>
				</p>
			</div>
		</template>

		<template v-if="hasSignedOldAgreement">
			<div class="form-group">
				<div class="alert alert-notice">
					{{
						$gettext(
							`You have signed an older version of the Distribution Agreement. To continue selling your games without disruption, you must accept the new agreement.`
						)
					}}
				</div>
			</div>
		</template>

		<div v-if="!hasSigned || hasSignedOldAgreement" class="form-group">
			<div class="small">
				<div>
					{{
						$gettext(
							`If you would like to sell games on the Marketplace, you must accept the Distribution Agreement.`
						)
					}}
				</div>
				<div>
					<RouterLink class="link-help" :to="{ name: 'landing.marketplace' }">
						{{ $gettext(`Learn more`) }}
					</RouterLink>
				</div>
			</div>
			<br />

			<AppFinancialsTosScroller>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div v-html="termsTemplate" />
			</AppFinancialsTosScroller>
			<br />

			<div class="checkbox">
				<label>
					<input v-model="checked" type="checkbox" />
					{{
						$gettext(
							`By checking this box and clicking the button below marked "I agree," I agree that I have read, understand, and agree to be bound by the terms of this agreement.`
						)
					}}
				</label>
			</div>
			<br />

			<AppButton primary solid :disabled="!checked" @click="onAccept()">
				{{ $gettext(`I agree`) }}
			</AppButton>
		</div>
	</fieldset>
</template>
