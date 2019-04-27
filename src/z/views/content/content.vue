<template>
	<div class="main">
		<div class="content">
			<div class="topbar">
				<h1>
					<app-jolticon icon="gamejolt" big />
					Game Jolt
				</h1>
				<div class="user-container" v-if="isHydrated">
					<span class="text-muted">Logged in as</span>
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
						<th>Source</th>
						<td>
							<a target="_blank" :href="resourceUrl">{{ resourceTitle }}</a>
						</td>
					</tr>
					<tr v-if="ownerName && ownerUrl">
						<th>Owner</th>
						<td>
							<a target="_blank" :href="ownerUrl">{{ ownerName }}</a>
						</td>
					</tr>
					<tr>
						<th>Last edit</th>
						<td>
							<app-time-ago :date="lastEdit" strict />
						</td>
					</tr>
				</table>

				<div class="content-container">
					<app-content-editor
						ref="editor"
						class="content-editor-moderate"
						:initial-content="contentJson"
						:content-context="contentContext"
					/>
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
					<app-button primary solid :disabled="!canSubmit" @click="submit">Submit</app-button>
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
