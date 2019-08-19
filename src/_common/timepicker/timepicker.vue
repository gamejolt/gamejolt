<template>
	<table class="timepicker">
		<tbody>
			<tr class="text-center">
				<td>
					<a @click="addHours(1)" class="timepicker-link">
						<app-jolticon icon="chevron-up" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a @click="addMinutes(1)" class="timepicker-link">
						<app-jolticon icon="chevron-up" big />
					</a>
				</td>
				<td v-show="showMeridian"></td>
			</tr>
			<tr>
				<td style="width: 50px;" class="form-group">
					<input
						ref="hours"
						type="text"
						v-model="hours"
						@blur="updateHours()"
						class="form-control text-center"
						:readonly="readonlyInput"
						:maxlength="2"
					/>
				</td>
				<td>:</td>
				<td style="width: 50px;" class="form-group">
					<input
						ref="minutes"
						type="text"
						v-model="minutes"
						@blur="updateMinutes()"
						class="form-control text-center"
						:readonly="readonlyInput"
						:maxlength="2"
					/>
				</td>
				<td v-show="showMeridian">
					<button
						type="button"
						class="timepicker-button text-center"
						@click.prevent="toggleMeridian()"
					>
						{{ meridian }}
					</button>
				</td>
			</tr>
			<tr class="text-center">
				<td>
					<a @click="addHours(-1)" class="timepicker-link">
						<app-jolticon icon="chevron-down" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a @click="addMinutes(-1)" class="timepicker-link">
						<app-jolticon icon="chevron-down" big />
					</a>
				</td>
				<td v-show="showMeridian"></td>
			</tr>
		</tbody>
	</table>
</template>

<style lang="stylus" src="./timepicker.styl" scoped></style>

<script lang="ts" src="./timepicker"></script>
