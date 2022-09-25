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
                        <h6>{{item.title}}</h6>
                        <span class="amount taviraj-font-family">Contributing: <span class="system-ui-font-family">£{{filterAmount(item.contribution)}}</span></span>
                      </div>
                    </div>
                  </div>
                </li>
            </ul>
            <div class="mt-3">
              <a href="javascript://" @click="changes" class="text-uppercase">Make changes</a>
            </div>
        </div>
        <div class="mt-5">
          <h5>Lastly some info</h5>
          <div class="mt-3">
            <label class="form-label">Your email address *</label>
            <input type="email" :class="hasFieldError(errors, 'email') ? 'form-control is-invalid' : 'form-control'" @change="emailUpdated" :value="stepTwo.email" required>
            <div v-if="hasFieldError(errors, 'email')" class="invalid-feedback taviraj-font-family">{{getFieldError(errors, 'email')}}</div>
          </div>
          <div class="mt-3">
            <label class="form-label">Optional personal message to the hosts</label>
            <textarea :class="hasFieldError(errors, 'message') ? 'form-control is-invalid' : 'form-control'" rows="5" @keyup="messageUpdated" @change="messageUpdated" :value="stepTwo.message"></textarea>
            <small id="messageHelp" :class="hasFieldError(errors, 'message') ? 'form-text invalid-feedback taviraj-font-family' : 'form-text text-muted taviraj-font-family'">{{getMessageLength(stepTwo.message)}}/{{messageCharLimit}} character(s) left</small>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" :checked="stepTwo.payFee" @click="payFee">
            <label class="form-check-label">
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
            messageCharLimit: Number,
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
            },
            getMessageLength(message) {
              return message === null ? 0 : String(message).length;
            }
        }
    };
</script>