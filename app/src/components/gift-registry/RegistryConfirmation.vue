<template>
    <form>
        <div class="mb-5">
            <h5>Contribution summary</h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="item of stepTwo.items" v-bind:key="item.uuid">{{item.title}} {{item.contribution.format()}}</li>
            </ul>
            <a href="javascript://" @click="changes">Make changes</a>
        </div>
        <div class="mb-3">
          <label class="form-label">Your email address *</label>
          <input type="email" :class="hasFieldError(errors, 'email') ? 'form-control is-invalid' : 'form-control'" @change="emailUpdated" :value="stepTwo.email" required>
          <div v-if="hasFieldError(errors, 'email')" class="invalid-feedback">{{getFieldError(errors, 'email')}}</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Write a personal message to the hosts (optional)</label>
            <textarea class="form-control" rows="5" @change="messageUpdated" :value="stepTwo.message"></textarea>
        </div>        
        <div class="form-check">
            <input class="form-check-input" type="checkbox" @click="payFee" :checked="stepTwo.payFee">
            <label class="form-check-label">
                Please indicate if you are would be happy to pay the transaction fee of 1.4% plus 20p we incur through our chosen payment provider Stripe.
            </label>
        </div>
    </form>
</template>
<script>
    export default { 
        name: "RegistryConfirmation",
        props: {
            stepTwo: Object,
            errors: Object,
        },
        methods: {
            payFee(e) {
                this.$emit('payFee', e.target.checked);
            },
            changes() {
                this.$emit('changes');
            },
            messageUpdated(e) {
                this.$emit('messageAdded', e.target.value);
            },
            emailUpdated(e) {
              this.$emit('emailAdded', e.target.value);
            },
            hasFieldError(errors, field) {
              return field in errors;
            },
            getFieldError(errors, field) {
              return this.hasFieldError(errors, field) ? errors[field] : '';
            }
        }
    };
</script>