<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { bangRef } from '../../../../utils/vue';
import AppAlertBox from '../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { UserTipaltiManagedAccount } from '../../../../_common/user/tipalti-managed-account/tipalti-managed-account';
import { userCanAccessCreatorForm } from '../../../../_common/user/user.model';
import AppCreatorTerms from './AppCreatorTerms.vue';
import AppFinancialsCheckmark from './AppFinancialsCheckmark.vue';

interface FormModel {
	tos_type?: 'creator';
}

const { user: maybeUser } = useCommonStore();
const user = bangRef(maybeUser);

const account = ref<UserStripeManagedAccount>();
const creatorAccount = ref<UserTipaltiManagedAccount>();
const creatorOnboardingForm = ref<string>();
const creatorOnboardingFormHeight = ref(200);

const isVerified = computed(() => creatorAccount.value?.onboarding_status === 'active');
const canAccessCreatorForm = computed(() => userCanAccessCreatorForm(user.value));

/**
 * This will handle any message events sent over to our page. Tipalti sends
 * messages over, so we can check the message data to see if it's from Tipalti
 * and handle it.
 */
function tipaltiHandler(e: MessageEvent) {
	if (!e || !e.data || !e.data.TipaltiIframeInfo) {
		return;
	}

	creatorOnboardingFormHeight.value = e.data.TipaltiIframeInfo.height ?? 200;

	e.stopImmediatePropagation();
}

onMounted(() => {
	window.addEventListener('message', tipaltiHandler);
});

onUnmounted(() => {
	window.removeEventListener('message', tipaltiHandler);
});

const form: FormController<FormModel> = createForm({
	reloadOnSubmit: true,
	loadUrl: `/web/dash/financials/save`,
	onLoad(payload) {
		if (payload.user) {
			user.value.assign(payload.user);
		}

		account.value = payload.account ? new UserStripeManagedAccount(payload.account) : undefined;
		creatorAccount.value = payload.creatorAccount
			? new UserTipaltiManagedAccount(payload.creatorAccount)
			: undefined;
		creatorOnboardingForm.value = payload.creatorOnboardingForm ?? undefined;
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/financials/save', form.formModel);
	},
	onSubmitError() {
		showErrorGrowl($gettext('Something went wrong.'));
	},
});

async function acceptTerms() {
	form.formModel.tos_type = 'creator';
	form.submit();
}
</script>

<template>
	<AppForm :controller="form" class="form-dashboard-financials">
		<template v-if="form.isLoadedBootstrapped">
			<template v-if="!isVerified">
				<AppAlertBox icon="notice" color="primary">
					{{
						$gettext(
							`Before you can earn money, we'll need to gather some details from you. This will ensure that your account is completely set up and ready to run smoothly.`
						)
					}}
				</AppAlertBox>
			</template>
			<template v-else>
				<AppAlertBox icon="check" color="primary">
					{{ $gettext(`Your creator account is ready to go!`) }}
				</AppAlertBox>
			</template>
			<br />

			<!-- First step is to sign an agreement. -->
			<AppCreatorTerms
				v-if="canAccessCreatorForm"
				:account="account"
				@accepted="acceptTerms()"
			/>

			<template v-if="creatorOnboardingForm">
				<h2 :style="{ marginTop: 0 }">
					{{ $gettext(`Payment settings`) }}
				</h2>

				<iframe
					:style="{
						display: `block`,
						width: `100%`,
						height: `${creatorOnboardingFormHeight}px`,
						border: 0,
					}"
					:src="creatorOnboardingForm"
					nwdisable
					nwfaketop
				/>
			</template>
			<template v-else-if="creatorAccount">
				<legend v-if="creatorAccount.onboarding_status === 'active'">
					<AppFinancialsCheckmark />
					{{ $gettext(`You're an approved creator!`) }}
				</legend>
				<template v-else-if="creatorAccount.onboarding_status === 'rejected'">
					<div class="alert">
						<p>
							{{
								$gettext(
									`We weren't able to approve you as a creator. Contact us for more info.`
								)
							}}
						</p>
					</div>
				</template>
				<template v-else>
					<div class="alert">
						<p>
							{{
								$gettext(
									`We are processing your creator application. We'll update you through email.`
								)
							}}
						</p>
					</div>
				</template>
			</template>
		</template>
	</AppForm>
</template>
