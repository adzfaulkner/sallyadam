<template>
    <form>
        <div class="contribution-summary-container">
            <h5>Your contributions</h5>
            <ul class="list-group list-group-flush mt-3">
                <li class="list-group-item" v-for="item of stepTwo.items" v-bind:key="item.uuid">
                  <div class="row">
                    <div class="col-2 p-0 d-flex align-items-center">
                      <img :src="generateImgPath(item.images.checkout)" class="img-fluid" alt="{{ item.title }}">
                    </div>
                    <div class="col-10 d-flex align-items-center">
                      <div>
                        <span class="title">{{item.title}}</span>
                        <span class="amount text-transform-none">Contributing: £{{filterAmount(item.contribution)}}</span>
                      </div>
                    </div>
                  </div>
                </li>
            </ul>
            <div class="mt-3">
              <a href="javascript://" @click="changes">Make changes</a>
            </div>
        </div>
        <div class="mt-5">
          <h5>Lastly some info</h5>
          <div class="mt-3">
            <label class="form-label text-transform-none">Your email address *</label>
            <input type="email" :class="hasFieldError(errors, 'email') ? 'form-control is-invalid' : 'form-control'" @change="emailUpdated" :value="stepTwo.email" required>
            <div v-if="hasFieldError(errors, 'email')" class="invalid-feedback text-transform-none">{{getFieldError(errors, 'email')}}</div>
          </div>
          <div class="mt-3">
            <label class="form-label text-transform-none">Write a personal message to the hosts (optional)</label>
            <textarea class="form-control" rows="5" @change="messageUpdated" :value="stepTwo.message"></textarea>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" @click="payFee" :checked="stepTwo.payFee">
            <label class="form-check-label text-transform-none">
              Include payment provider fees (1.4% plus 20P).
            </label>
          </div>
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
            },
            filterAmount(amount) {
              if (amount === null) {
                return '';
              }

              if (amount.format().substring(amount.format().length - 3) === '.00') {
                return amount.value;
              }

              return amount;
            },
            generateImgPath(img) {
              const images = require.context('@/assets/img/', false, /\.jpg$/)
              return images('./' + img);
            }
        }
    };
</script>