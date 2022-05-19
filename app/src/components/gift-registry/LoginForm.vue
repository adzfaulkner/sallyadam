<template>
    <form @submit.prevent="submit">
        <div class="text-center alert alert-warning fw-bold" role="alert">
          Guest passwords will be sent out via email out in due course.
        </div>
        <div v-if="loginError" class="alert alert-danger" role="alert">
            {{ loginError }}
        </div>
        <div class="mb-3">
            <label for="pwd" class="form-label">Guest Password</label>
            <input type="password" class="form-control" id="pwd" v-model="form.password" :disabled="submitDisabled">
        </div>
        <input type="submit" class="btn btn-primary btn-rsvp" :disabled="submitDisabled" value="Submit" />
    </form>    
</template>
<script>
    export default {  
        name: "LoginForm",
        data() {
            return {
                form: {
                    password: "",
                },
            };
        },
        props: {
            loginError: String,
            submitDisabled: Boolean,
        },
        methods: {
            async submit() {
                const { password } = this.form;
                this.$emit('submitted', password);
            },
        },
    }
</script>