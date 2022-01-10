<script lang="ts" src="./add"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext(`Title`)">
			<app-form-control
				v-app-focus-when
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				:placeholder="defaultTitle"
				@blur="onBlurTitle"
			/>
			<app-form-control-errors />
			<div class="help-block">
				<translate>Let everyone know what you're doing in this fireside.</translate>
			</div>
		</app-form-group>

		<template v-if="canSelectCommunity">
			<app-form-group name="community_id" :label="$gettext(`Start in a community?`)">
				<div class="help-block">
					<translate>
						You can start firesides in communities you collaborate on. If you do,
						community members will be notified and other collaborators can stream with
						you.
					</translate>
				</div>

				<app-forms-community-pill
					v-if="selectedCommunity"
					:community="selectedCommunity"
					:with-channel="false"
					@remove="onRemoveCommunity"
				/>
				<app-forms-community-pill-add
					v-else
					:communities="selectableCommunities"
					:with-channel="false"
					@add-community="onAddCommunity"
				/>
			</app-form-group>
		</template>

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>Let's go!</translate>
		</app-form-button>
		<app-form-button
			:solid="false"
			:primary="false"
			:disabled="!valid"
			trans
			@before-submit="onDraftSubmit()"
		>
			<translate>Start as draft</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
