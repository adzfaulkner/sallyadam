<template>
    <form>
        <div class="mb-5">
            <h5>Contribution summary</h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="(value, uuid) of contributions" v-bind:key="uuid">{{registryData[registryDataMap[uuid]].title}} {{value.format()}}</li>
            </ul>
            <a href="javascript://" @click="changes">Make changes</a>
        </div>
        <div class="mb-3">
            <label class="form-label">Write a personal message to the hosts (optional)</label>
            <textarea class="form-control" rows="5" @change="messageUpdated" :value="messageInput"></textarea>
        </div>        
        <div class="form-check">
            <input class="form-check-input" type="checkbox" @click="payFee" :checked="willPayFee">
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
            registryData: Object,
            registryDataMap: Object,
            contributions: Object,
            messageInput: String,
            willPayFee: Boolean,
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
            }
        }
    };
</script>