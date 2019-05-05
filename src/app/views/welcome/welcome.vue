import { darken } from 'polished';
<template>
	<div class="-welcome-page">
		<div class="-welcome-col">
			<section class="-message">
				<p class="lead">
					<translate>
						Before you go game spelunking, let's customize your profile.
					</translate>
				</p>
			</section>

			<section class="-avatar">
				<app-editable-overlay @click="chooseAvatar()" :disabled="inputDisabled">
					<translate slot="overlay">Change</translate>
					<app-user-avatar :user="user" />
				</app-editable-overlay>
			</section>

			<section class="-bio">
				<textarea
					ref="bio"
					class="form-control"
					v-model="user.description_markdown"
					:disabled="inputDisabled"
					:placeholder="$gettext('Tell people about yourself')"
				></textarea>
			</section>

			<section class="-controls">
				<template v-if="isSkip">
					<app-button class="-muted" block trans :disabled="inputDisabled" @click="onNext">
						<translate>Skip</translate>
					</app-button>
				</template>
				<template v-else>
					<app-button primary block solid :disabled="inputDisabled" @click="onNext">
						<translate>Next</translate>
					</app-button>
				</template>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" src="./welcome.styl" scoped></style>

<script lang="ts" src="./welcome"></script>
