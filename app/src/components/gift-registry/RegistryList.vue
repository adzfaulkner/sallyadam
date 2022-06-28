<template>
    <form>
        <div :class="index > 0 ? 'card border-top pt-4' : 'card'" v-for="(item, index) of stepOne.items" v-bind:key="item.uuid">
            <img :src="generateImgPath(item.images.list)" class="card-img-top" alt="{{ item.title }}" rel="preload">
            <div class="card-body">
                <h5 class="card-title mt-2">{{ item.title }}</h5>
                <p class="card-text mt-3">{{ item.description }}</p>
            </div>
            <form class="mb-4 text-end">
              <label class="col-form-label me-2 fw-bolder">Contribute?</label>
              <select class="form-select d-inline w-auto form-select-lg" :ref="item.uuid" @change="() => addContribution(item.uuid)">
                <option v-for="(val) in increments" :key=val :selected="val === filterAmount(item.contribution)">£{{val}}</option>
              </select>
            </form>
        </div>
    </form>
</template>
<script>
    import currency from "currency.js";

    export default { 
        name: "RegistryList",
        props: {
            stepOne: Object,
            errors: Object,
        },
        data: () => (
          {
            increments: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100]
          }
        ),
        methods: {
            filterAmount(amount) {
                if (amount === null) {
                  return 0;
                }

                if (amount.format().substring(amount.format().length - 3) === '.00') {
                    return amount.value;
                }

                return amount;
            },
            addContribution(uuid) {
                this.$emit('contribute', uuid, currency(this.$refs[uuid][0].value, {symbol: '£'}));
            },
            generateImgPath(img) {
              const images = require.context('@/assets/img/', false, /\.jpg$/)
              return images('./' + img);
            }
        }
    };
</script>