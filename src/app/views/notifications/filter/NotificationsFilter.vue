<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { stringSort } from '../../../../utils/array';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import {
	Notification,
	NOTIFICATION_FEED_TYPE_LABELS,
} from '../../../../_common/notification/notification-model';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { routeNotifications } from '../notifications.route';
import { NOTIFICATION_FILTER_QUERY } from '../RouteNotifications.vue';

interface FormModel {
	[k: string]: boolean;
}

const props = defineProps({
	filters: {
		type: Array as PropType<string[]>,
		required: true,
	},
	replaceRoute: {
		type: Boolean,
	},
});

const { filters, replaceRoute } = toRefs(props);

const modal = useModal()!;
const router = useRouter();

const form: FormController<FormModel> = createForm({
	onInit() {
		Notification.NOTIFICATION_FEED_TYPES.sort((a, b) => stringSort(a, b)).forEach(i => {
			form.formModel[i] = filters.value.includes(i);
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
		if (
			enabledTypes.length &&
			enabledTypes.length !== Notification.NOTIFICATION_FEED_TYPES.length
		) {
			query[NOTIFICATION_FILTER_QUERY] = enabledTypes.join(',');
		}

		const routeData: RouteLocationRaw = {
			name: routeNotifications.name,
			query,
		};

		if (replaceRoute.value) {
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
						class="-group"
						:name="option"
						label-class="-group-link"
						:label="NOTIFICATION_FEED_TYPE_LABELS[option]"
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
