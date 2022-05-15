<template>
    <div>
        <div class="card" v-for="item of registryData" v-bind:key="item.uuid">
            <img src="@/assets/img/spacer.jpg" class="card-img-top" alt="{{ item.title }}">
            <div class="card-body">
                <h5 class="card-title">{{ item.title }}</h5>
                <p class="card-text">{{ item.description }}</p>
            </div>
            <div class="contribute-container">
                <div class="input-group">
                    <span class="input-group-text">£</span>
                    <input type="number" class="form-control" min="0" placeholder="0.00" aria-label="Amount" :ref="item.uuid" :value="filterAmount(contributions[item.uuid])">
                    <button class="btn btn-secondary" @click="() => addContribution(item.uuid)">Contribute</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import currency from "currency.js";

    export default { 
        name: "RegistryList",
        props: {
            registryData: Object,
            contributions: Object,
        },
        methods: {
            filterAmount(amount) {
                if (amount === undefined) {
                    return '';
                }

                if (amount.format().substring(amount.format().length - 3) === '.00') {
                    return amount.value;
                }

                return amount;
            },
            addContribution(uuid) {
                this.$emit('contribute', uuid, currency(this.$refs[uuid][0].value, {symbol: '£'}));
            },
        }
    };
</script>