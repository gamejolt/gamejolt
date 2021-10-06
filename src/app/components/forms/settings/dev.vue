<script lang="ts" src="./dev"></script>

<template>
	<app-form ref="form" name="settingsFormDev" @changed="onChange">
		<fieldset id="settings-dev">
			<legend>
				<translate>Dev</translate>
			</legend>

			<app-form-group
				v-for="test of tests"
				:key="test.name"
				:name="test.name"
				:label="`Test: ${test.name}`"
			>
				<app-form-control-toggle v-if="isBool(test)" class="pull-right" />
				<app-form-control-select v-else-if="isString(test)">
					<option v-for="v in stringValues(test)" :key="v" :value="v">
						{{ v }}
					</option>
				</app-form-control-select>
			</app-form-group>
		</fieldset>
	</app-form>
</template>
