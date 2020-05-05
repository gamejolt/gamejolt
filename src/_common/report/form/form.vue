<template>
	<app-form name="reportForm">
		<app-form-group name="reason" :label="$gettext(`What's the reason?`)">
			<div v-for="reason of reasons" :key="reason.radioValue">
				<div class="radio">
					<label>
						<app-form-control-radio
							type="radio"
							:value="reason.radioValue"
							@changed="onChangeReason"
						/>
						{{ reason.text }}
					</label>
				</div>

				<div v-if="formModel.reason === reason.radioValue && !!reason.source">
					<app-form-group name="source" hide-label>
						<app-form-control
							type="text"
							:rules="{
								max: maxLengthSource,
							}"
							:placeholder="reason.source.placeholder"
						/>

						<app-form-control-errors />
					</app-form-group>
				</div>

				<div v-if="formModel.reason === reason.radioValue && !!reason.contexts" class="-context">
					<app-form-group
						name="context"
						:label="
							$gettext(/** TODO(copy) */ `Select one or more options that the report applies to`)
						"
					>
						<div class="checkbox" v-for="context of reason.contexts" :key="context.checkValue">
							<label>
								<app-form-control-checkbox :value="context.checkValue" />

								{{ context.text }}
							</label>
						</div>
					</app-form-group>
				</div>

				<div v-if="formModel.reason === reason.radioValue && !!reason.infoText">
					<p class="help-block">
						<!-- TODO(copy) -->
						<app-jolticon icon="exclamation-circle" />
						{{ reason.infoText }}
					</p>
				</div>
			</div>
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext(/** TODO(copy) */ `Describe your report`)"
			:optional="isDescriptionOptional"
		>
			<app-form-control-textarea
				type="text"
				:rules="{
					max: maxLengthDescription,
				}"
			/>

			<app-form-control-errors :label="$gettext(`description`)" />
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Send Report</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped>
.-context
	margin-left: 32px
</style>

<script lang="ts" src="./form"></script>
