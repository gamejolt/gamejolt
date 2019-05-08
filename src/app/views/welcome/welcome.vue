<template>
	<div class="-welcome fill-darkest">
		<div class="-content">
			<section class="-message">
				<p class="lead sans-margin-bottom">
					<translate>
						Let's get you set up!
					</translate>
				</p>
			</section>

			<section class="-avatar">
				<app-editable-overlay @click="chooseAvatar()" :disabled="isInputDisabled">
					<translate slot="overlay">Change</translate>
					<app-user-avatar :user="user" />
				</app-editable-overlay>
			</section>

			<section class="-bio">
				<textarea
					class="form-control"
					v-model="bio"
					@change="onBioChanged"
					:disabled="isInputDisabled"
					rows="3"
					:placeholder="$gettext(`Tell people about yourself`)"
				/>
			</section>

			<section class="-controls">
				<template v-if="!isNext">
					<app-button class="-muted" block trans :disabled="isInputDisabled" @click="onNext">
						<translate>Skip</translate>
					</app-button>
				</template>
				<template v-else>
					<app-button primary block solid :disabled="isInputDisabled" @click="onNext">
						<translate>Next</translate>
					</app-button>
				</template>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" src="./welcome.styl" scoped></style>

<script lang="ts" src="./welcome"></script>
