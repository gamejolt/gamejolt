<script lang="ts" src="./block"></script>

<template>
	<app-form name="communityBlockForm">
		<app-form-group name="username">
			<app-form-control
				type="text"
				:rules="{
					max: 100,
					availability: {
						url: `/web/dash/communities/blocks/check-field-availability/${community.id}`,
						initVal: undefined,
					},
				}"
				:validate-on="['blur']"
				:disabled="usernameLocked"
			/>

			<app-form-control-errors :label="$gettext('username')">
				<app-form-control-error
					when="availability"
					:message="$gettext(`This user does not exist.`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-group name="reasonType" :label="$gettext('Block reason')">
			<div v-for="(reasonDisplay, reason) in defaultReasons" :key="reason" class="radio">
				<label>
					<app-form-control-radio :value="reason" />
					{{ reasonDisplay }}
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group v-if="showReasonOther" name="reason" hide-label>
			<div class="help-inline">
				<span v-translate>
					Enter other block reason.
					<b>This is shown to the blocked user.</b>
				</span>
			</div>
			<app-form-control
				type="text"
				:rules="{
					max: 100,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="expiry" :label="$gettext('Block expires in...')">
			<div v-for="(expiryDisplay, expiry) in expiryOptions" :key="expiry" class="radio">
				<label>
					<app-form-control-radio :value="expiry" />
					{{ expiryDisplay }}
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="ejectPosts"
			:label="$gettext(`Eject user's posts from the community?`)"
		>
			<app-form-control-toggle class="pull-right" />
			<p class="help-block">
				<translate>
					Once the user is blocked, all their posts will be ejected from the community.
					This also affects their featured posts.
				</translate>
			</p>
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Block</translate>
		</app-form-button>
	</app-form>
</template>
