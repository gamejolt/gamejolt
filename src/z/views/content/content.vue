<template>
	<div class="main">
		<div class="content">
			<div class="topbar">
				<h1>
					<app-jolticon icon="gamejolt" big />
					Game Jolt
				</h1>
				<div class="user-container" v-if="isHydrated">
					<span class="text-muted"><translate>Logged in as</translate></span>
					<img :src="user.img_avatar" />
					<span class="username">{{ user.display_name }}</span>
				</div>
			</div>
			<div v-if="hasErrors">
				<div v-for="error of errors" :key="error" class="error-message">
					{{ error }}
				</div>
			</div>
			<template v-if="isHydrated">
				<h2>Edit {{ title }}</h2>
				<table class="text-muted">
					<tr>
						<th><translate>Source</translate></th>
						<td>
							<a target="_blank" :href="resourceUrl">{{ resourceTitle }}</a>
						</td>
					</tr>
					<tr v-if="ownerName && ownerUrl">
						<th><translate>Owner</translate></th>
						<td>
							<a target="_blank" :href="ownerUrl">{{ ownerName }}</a>
						</td>
					</tr>
					<tr>
						<th><translate>Last edit</translate></th>
						<td>
							<app-time-ago :date="lastEdit" strict />
						</td>
					</tr>
				</table>

				<div class="content-container">
					<app-content-editor
						class="content-editor-moderate"
						:source="contentJson"
						:content-context="contentContext"
						@update="onUpdate"
					/>
				</div>
				<div class="help-block">
					<app-jolticon icon="info-circle" />
					<translate>Image uploads are currently unavailable.</translate>
				</div>

				<div class="log-reason">
					<textarea
						id="log-reason"
						class="log-field"
						placeholder="Reason for editing"
						:value="logReason"
						@input="onChangeLogReason"
					/>
				</div>

				<div class="controls">
					<app-button primary solid :disabled="!canSubmit" @click="submit">
						<translate>Submit</translate>
					</app-button>
				</div>
			</template>
			<app-loading v-else />
		</div>

		<div v-if="isLoading" class="loading-overlay">
			<app-loading big centered />
		</div>
	</div>
</template>

<style lang="stylus" src="./content.styl" scoped></style>

<script lang="ts" src="./content"></script>
