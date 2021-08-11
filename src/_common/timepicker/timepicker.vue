<script lang="ts" src="./timepicker"></script>

<template>
	<table class="timepicker">
		<tbody>
			<tr class="text-center">
				<td>
					<a class="timepicker-link" @click="addHours(1)">
						<app-jolticon icon="chevron-up" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a class="timepicker-link" @click="addMinutes(1)">
						<app-jolticon icon="chevron-up" big />
					</a>
				</td>
				<td v-show="showMeridian" />
			</tr>
			<tr>
				<td style="width: 50px" class="form-group">
					<input
						ref="hours"
						v-model="hours"
						type="text"
						class="form-control text-center"
						:readonly="readonlyInput"
						:maxlength="2"
						@blur="updateHours()"
					/>
				</td>
				<td>:</td>
				<td style="width: 50px" class="form-group">
					<input
						ref="minutes"
						v-model="minutes"
						type="text"
						class="form-control text-center"
						:readonly="readonlyInput"
						:maxlength="2"
						@blur="updateMinutes()"
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
					<a class="timepicker-link" @click="addHours(-1)">
						<app-jolticon icon="chevron-down" big />
					</a>
				</td>
				<td>&nbsp;</td>
				<td>
					<a class="timepicker-link" @click="addMinutes(-1)">
						<app-jolticon icon="chevron-down" big />
					</a>
				</td>
				<td v-show="showMeridian" />
			</tr>
		</tbody>
	</table>
</template>

<style lang="stylus" src="./timepicker.styl" scoped></style>
