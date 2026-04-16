<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppFinancialsCheckmark from '~app/components/forms/financials/AppFinancialsCheckmark.vue';
import AppFinancialsTosScroller from '~app/components/forms/financials/AppFinancialsTosScroller.vue';
import AppButton from '~common/button/AppButton.vue';
import { formatDate } from '~common/filters/date';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserStripeManagedAccountModel } from '~common/user/stripe-managed-account/stripe-managed-account';
import { html as termsTemplate } from '~lib/terms/creator/global.md';

type Props = {
	account?: UserStripeManagedAccountModel;
};
const { account } = defineProps<Props>();

const emit = defineEmits<{
	accepted: [];
}>();

const checked = ref(false);

const hasSigned = computed(() => account && account.tos_signed_creator > 0);

const agreementLink = computed(
	() =>
		'https://github.com/gamejolt/terms/blob/d78d92b9d7879788e7ac20f31970c85e398badb7/creator/global.md'
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
			{{ $gettext(`Creator Agreement`) }}
		</legend>

		<template v-if="!hasSigned">
			<div class="form-group">
				<div class="small">
					<div>
						{{
							$gettext(
								`If you would like to be a Game Jolt Creator, you must accept the Creator Agreement.`
							)
						}}
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
		</template>
		<template v-else>
			<div class="form-group">
				<p class="small">
					{{
						$gettext(`You have agreed to our Creator Agreement on %{ date }.`, {
							date: formatDate(account!.tos_signed_creator_timestamp, 'medium'),
						})
					}}
					<br />
					<AppLinkExternal :href="agreementLink">
						{{ $gettext(`View Creator Agreement`) }}
					</AppLinkExternal>
				</p>
			</div>
		</template>
	</fieldset>
</template>
