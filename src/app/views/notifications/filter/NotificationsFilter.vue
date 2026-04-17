<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';

import { routeNotifications } from '~app/views/notifications/notifications.route';
import { NOTIFICATION_FILTER_QUERY } from '~app/views/notifications/RouteNotifications.vue';
import AppButton from '~common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '~common/form-vue/AppFormStickySubmit.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import {
	getNotificationFeedTypeLabels,
	NotificationFeedTypes,
} from '~common/notification/notification-model';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import { stringSort } from '~utils/array';

type FormModel = {
	[k: string]: boolean;
};

type Props = {
	filters: string[];
	replaceRoute?: boolean;
};
const { filters, replaceRoute } = defineProps<Props>();

const modal = useModal()!;
const router = useRouter();
const { user } = useCommonStore();

const notificationLabels = computed(() => getNotificationFeedTypeLabels(user.value!));

const form: FormController<FormModel> = createForm<FormModel>({
	onInit() {
		NotificationFeedTypes.sort((a, b) => stringSort(a, b)).forEach(i => {
			form.formModel[i] = filters.includes(i);
		});
	},
	async onSubmit() {
		const entries = Object.entries(form.formModel);

		const enabledTypes = entries.reduce((result, [key, enabled]) => {
			if (enabled) {
				result.push(key);
			}
			return result;
		}, [] as string[]);

		let query: any = {};

		// Submit this only if we have filters and if they're not all enabled.
		if (enabledTypes.length && enabledTypes.length !== NotificationFeedTypes.length) {
			query[NOTIFICATION_FILTER_QUERY] = enabledTypes.join(',');
		}

		const routeData: RouteLocationRaw = {
			name: routeNotifications.name,
			query,
		};

		if (replaceRoute) {
			router.replace(routeData);
		} else {
			router.push(routeData);
		}

		modal.resolve();
	},
});

function toggleField(key: string) {
	form.formModel[key] = !form.formModel[key];
	form.changed = true;
}

function assignAll(value: boolean) {
	for (const key of Object.keys(form.formModel)) {
		form.formModel[key] = value;
	}
	form.changed = true;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Notification filters`) }}
			</h2>
		</div>

		<div class="modal-body">
			<AppForm :controller="form">
				<div class="-action-row">
					<AppButton class="-action" block solid @click="assignAll(false)">
						{{ $gettext(`Clear all`) }}
					</AppButton>

					<AppButton class="-action" block solid @click="assignAll(true)">
						{{ $gettext(`Enable all`) }}
					</AppButton>
				</div>

				<AppSpacer vertical :scale="4" />

				<div
					v-for="(option, index) of Object.keys(form.formModel)"
					:key="option"
					class="-group-link"
					@click.capture.stop="toggleField(option)"
				>
					<AppFormGroup
						v-if="(notificationLabels as Record<string, string>)[option]"
						class="-group"
						:name="option"
						label-class="-group-link"
						:label="(notificationLabels as Record<string, string>)[option]"
					>
						<template #inline-control>
							<AppFormControlToggle />
						</template>

						<hr
							v-if="index < Object.keys(form.formModel).length - 1"
							class="-divider"
						/>
					</AppFormGroup>
				</div>

				<AppFormStickySubmit v-if="Object.values(form.formModel).some(i => i)">
					<AppFormButton>
						{{ $gettext(`Apply`) }}
					</AppFormButton>
				</AppFormStickySubmit>
			</AppForm>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-action-row
	display: flex
	align-items: flex-end
	gap: 8px

.-action
	margin-top: 0 !important

.-divider
	margin: 0

::v-deep(.-group-link)
	cursor: pointer

.-group
	margin-bottom: 0
	padding-top: 8px
	padding-bottom: 8px
</style>
