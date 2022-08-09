<template>
    <form @submit.prevent="submit">
        <div v-if="loginError" class="alert alert-danger" role="alert">
            {{ loginError }}
        </div>
        <div class="mb-3">
            <label for="pwd" class="form-label">Guest Password</label>
            <input type="password" class="form-control" id="pwd" v-model="form.password" :disabled="submitDisabled">
            <div class="form-text mt-3 mb-4">Your guest password should have been sent to you via email.<br/><br/>If you can't find the email then check your junk mail. Failing that, contact either Sally or Adam for assistance.</div>
        </div>
        <input type="submit" class="btn btn-primary btn-rsvp" :disabled="submitDisabled" value="SUBMIT" />
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