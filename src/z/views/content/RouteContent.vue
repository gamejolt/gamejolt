<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { ContextCapabilities } from '~common/content/content-context';
import { ContentDocument } from '~common/content/content-document';
import AppContentEditor from '~common/content/content-editor/AppContentEditor.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import { Navigate } from '~common/navigate/navigate.service';
import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { touchUser } from '~common/user/user.model';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['resource', 'resource-Id'] },
		resolver: async ({ route }) => {
			await touchUser();

			return await Api.sendRequest(
				`/z/content/${route.params.resource}/${route.params.resourceId}`
			);
		},
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const isHydrated = ref(false);
const isLoading = ref(false);
const requireLog = ref(true);
const errors = ref<string[]>([]);

const contentJson = ref('');
const contentContext = ref('');
const lastEdit = ref(0);
const resourceTitle = ref('');
const resourceUrl = ref('');
const resourceType = ref('');
const resourceId = ref(0);
const ownerName = ref('');
const ownerUrl = ref('');
const maxLength = ref(0);
const contentCapabilities = ref<ContextCapabilities>();
const logReason = ref('');
const currentContentLength = ref(0);

function camelCase(str: string) {
	return str.replace(/-([a-z])/gi, function (_all, letter) {
		return ' ' + letter.toUpperCase();
	});
}

const title = computed(() => {
	let t = camelCase(contentContext.value);
	t = t[0].toUpperCase() + t.substr(1);
	return t;
});

const canSubmit = computed(() => {
	if (currentContentLength.value > maxLength.value) {
		return false;
	}
	return logReason.value.length > 0 || !requireLog.value;
});

const hasErrors = computed(() => errors.value.length > 0);

createAppRoute({
	onResolved({ payload }) {
		contentJson.value = payload.content;
		contentContext.value = payload.context;

		const doc = ContentDocument.fromJson(contentJson.value!);
		lastEdit.value = doc.createdOn;

		resourceTitle.value = payload.resourceTitle;
		resourceUrl.value = payload.resourceUrl;
		ownerName.value = payload.ownerName;
		ownerUrl.value = payload.ownerUrl;
		resourceType.value = payload.resourceType;
		resourceId.value = payload.resourceId || parseInt(route.params.resourceId.toString(), 10);
		requireLog.value = payload.requireLog;
		maxLength.value = payload.maxLength;
		contentCapabilities.value = ContextCapabilities.fromPayloadList(
			payload.contentCapabilities
		);

		isHydrated.value = true;
	},
});

function onChangeLogReason() {
	const elem = document.getElementById('log-reason') as HTMLTextAreaElement;
	logReason.value = elem.value;
}

function onUpdate(source: string) {
	contentJson.value = source;
	currentContentLength.value = ContentDocument.fromJson(contentJson.value).getLength();
}

async function submit() {
	isLoading.value = true;
	const doc = ContentDocument.fromJson(contentJson.value);
	if (doc instanceof ContentDocument) {
		const json = doc.toJson();
		try {
			const payload = await Api.sendRequest(
				`/z/content/save/${route.params.resource}/${route.params.resourceId}`,
				{ content: json, log_reason: logReason.value },
				{ noErrorRedirect: true }
			);

			const redirectUrl = payload.redirectUrl;
			Navigate.gotoExternal(redirectUrl);
		} catch (e) {
			errors.value.push('Failed to save changes.');
			console.error('Error while trying to process request', e);
		} finally {
			isLoading.value = false;
		}
	}
}
</script>

<template>
	<div class="main">
		<div class="content">
			<div v-if="hasErrors">
				<div v-for="error of errors" :key="error" class="error-message">
					{{ error }}
				</div>
			</div>

			<template v-if="isHydrated">
				<h2>Edit {{ title }}</h2>
				<table class="text-muted">
					<tbody>
						<tr>
							<th><AppTranslate>Source</AppTranslate></th>
							<td>
								<a target="_blank" :href="resourceUrl">{{ resourceTitle }}</a>
							</td>
						</tr>
						<tr v-if="ownerName && ownerUrl">
							<th><AppTranslate>Owner</AppTranslate></th>
							<td>
								<a target="_blank" :href="ownerUrl">{{ ownerName }}</a>
							</td>
						</tr>
						<tr>
							<th><AppTranslate>Last edit</AppTranslate></th>
							<td>
								<AppTimeAgo :date="lastEdit" strict />
							</td>
						</tr>
					</tbody>
				</table>

				<div class="content-container">
					<AppContentEditor
						class="content-editor-moderate"
						:value="contentJson"
						:content-context="contentContext as any"
						:capabilities="contentCapabilities!"
						:model-data="{
							type: 'resource',
							resource: resourceType,
							resourceId,
						}"
						:model-id="resourceId"
						:max-height="800"
						@input="onUpdate"
					/>
				</div>

				<br />

				<div class="log-reason">
					<textarea
						id="log-reason"
						rows="2"
						class="log-field"
						:placeholder="'Reason for editing' + (requireLog ? ' (required)' : '')"
						:value="logReason"
						@input="onChangeLogReason"
					/>
				</div>

				<div class="controls">
					<AppButton primary solid :disabled="!canSubmit" @click="submit">
						<AppTranslate>Submit</AppTranslate>
					</AppButton>
				</div>
			</template>
			<AppLoading v-else />
		</div>

		<div v-if="isLoading" class="loading-overlay">
			<AppLoading big centered />
		</div>
	</div>
</template>

<style lang="stylus" src="~z/views/content/content.styl" scoped></style>
