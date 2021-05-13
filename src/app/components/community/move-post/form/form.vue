<script lang="ts" src="./form"></script>

<template>
	<app-form name="communityMovePostForm">
		<app-form-group
			name="notifyUser"
			:label="$gettext(`Do you want to notify the author that their post got moved?`)"
		>
			<div
				v-for="(optionDisplay, optionValue) in notifyUserOptions"
				:key="optionValue"
				class="radio"
			>
				<label>
					<app-form-control-radio :value="optionValue" />
					{{ optionDisplay }}
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group v-if="shouldShowReasons" name="reasonType" :label="$gettext('Move reason')">
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
					Enter other move reason.
					<b>This is shown to the post author.</b>
				</span>
			</div>
			<app-form-control
				type="text"
				html-list-id="move-post-reasons-list"
				:rules="{
					max: 100,
				}"
			/>
			<datalist id="move-post-reasons-list">
				<option v-for="optionStr of otherOptions" :key="optionStr" :value="optionStr" />
			</datalist>
			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>
