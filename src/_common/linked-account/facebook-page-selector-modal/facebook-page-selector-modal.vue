<script lang="ts" src="./facebook-page-selector-modal"></script>

<template>
	<app-modal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>

			<div class="row">
				<app-linked-account provider="facebook" :account="account" preview>
					<app-loading v-if="isLoading" />
					<div v-else>
						<div v-if="!hasPages">
							<small class="text-muted">
								<translate>
									You have no Facebook Pages associated with your account.
								</translate>
							</small>
						</div>
						<div v-for="page of pages" :key="page.id">
							<input
								:id="page.id"
								type="radio"
								:value="page.id"
								name="pages"
								:checked="page.id === selectedPage.id"
								@change="changeSelected($event.target.value)"
							/>
							<label :for="page.id">{{ page.name }}</label>
							<small
								v-if="
									account.facebookSelectedPage &&
									page.id === account.facebookSelectedPage.id
								"
								class="text-muted"
							>
								<translate>Currently Linked</translate>
							</small>
						</div>
					</div>
				</app-linked-account>
			</div>
		</div>

		<div class="modal-footer">
			<app-button primary solid :disabled="!canConfirm" @click="ok">
				<translate>OK</translate>
			</app-button>
			<app-button trans @click="cancel">
				<translate>Cancel</translate>
			</app-button>
		</div>
	</app-modal>
</template>
