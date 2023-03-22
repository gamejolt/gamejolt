<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { ContextCapabilities } from '../../../_common/content/content-context';
import { ContentDocument } from '../../../_common/content/content-document';
import AppContentEditor from '../../../_common/content/content-editor/AppContentEditor.vue';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import AppTimeAgo from '../../../_common/time/AppTimeAgo.vue';
import { User } from '../../../_common/user/user.model';

@Options({
	name: 'RouteContent',
	components: {
		AppContentEditor,
		AppLoading,
		AppTimeAgo,
	},
})
@OptionsForRoute({
	deps: { params: ['resource', 'resource-Id'] },
	async resolver({ route }) {
		await User.touch();
		const payload = await Api.sendRequest(
			`/z/content/${route.params.resource}/${route.params.resourceId}`
		);
		return payload;
	},
})
export default class RouteContent extends BaseRouteComponent {
	isHydrated = false;
	isLoading = false;
	requireLog = true;
	errors = [] as string[];

	contentJson!: string;
	contentContext!: string;
	lastEdit!: number;
	resourceTitle!: string;
	resourceUrl!: string;
	resource!: string;
	resourceId!: number;
	ownerName!: string;
	ownerUrl!: string;
	maxLength!: number;
	contentCapabilities!: ContextCapabilities;
	logReason = '';
	currentContentLength = 0;

	camelCase(str: string) {
		return str.replace(/-([a-z])/gi, function (_all, letter) {
			return ' ' + letter.toUpperCase();
		});
	}

	get title() {
		let title = this.camelCase(this.contentContext);
		title = title[0].toUpperCase() + title.substr(1);
		return title;
	}

	get canSubmit() {
		if (this.currentContentLength > this.maxLength) {
			return false;
		}

		return this.logReason.length > 0 || !this.requireLog;
	}

	get routeTitle() {
		if (this.isHydrated) {
			return 'Edit ' + this.title;
		}
		return null;
	}

	get hasErrors() {
		return this.errors.length > 0;
	}

	routeResolved($payload: any) {
		this.contentJson = $payload.content;
		this.contentContext = $payload.context;

		const doc = ContentDocument.fromJson(this.contentJson!);
		this.lastEdit = doc.createdOn;

		this.resourceTitle = $payload.resourceTitle;
		this.resourceUrl = $payload.resourceUrl;
		this.ownerName = $payload.ownerName;
		this.ownerUrl = $payload.ownerUrl;
		this.resource = $payload.resource || this.$route.params.resource;
		this.resourceId =
			$payload.resourceId || parseInt(this.$route.params.resourceId.toString(), 10);
		this.requireLog = $payload.requireLog;
		this.maxLength = $payload.maxLength;
		this.contentCapabilities = ContextCapabilities.fromPayloadList(
			$payload.contentCapabilities
		);

		this.isHydrated = true;
	}

	onChangeLogReason() {
		const elem = document.getElementById('log-reason') as HTMLTextAreaElement;
		this.logReason = elem.value;
	}

	onUpdate(source: string) {
		this.contentJson = source;
		this.currentContentLength = ContentDocument.fromJson(this.contentJson).getLength();
	}

	async submit() {
		this.isLoading = true;
		const doc = ContentDocument.fromJson(this.contentJson);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			try {
				const payload = await Api.sendRequest(
					`/z/content/save/${this.$route.params.resource}/${this.$route.params.resourceId}`,
					{ content: contentJson, log_reason: this.logReason },
					{ noErrorRedirect: true }
				);

				const redirectUrl = payload.redirectUrl;
				Navigate.gotoExternal(redirectUrl);
			} catch (e) {
				this.errors.push('Failed to save changes.');
				console.error('Error while trying to process request', e);
			} finally {
				this.isLoading = false;
			}
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
				</table>

				<div class="content-container">
					<AppContentEditor
						class="content-editor-moderate"
						:value="contentJson"
						:content-context="contentContext"
						:capabilities="contentCapabilities"
						:model-data="{
							// TODO(reactions) test this
							resource,
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

<style lang="stylus" src="./content.styl" scoped></style>
