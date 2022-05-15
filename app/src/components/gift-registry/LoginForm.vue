<template>
    <form @submit.prevent="submit">
        <div class="text-center alert alert-warning fw-bold" role="alert">
          Login credentials will be sent via email to RSVP'd guests in due course.
        </div>
        <div v-if="loginError" class="alert alert-danger" role="alert">
            {{ loginError }}
        </div>
        <div class="mb-3">
            <label for="un" class="form-label">Username</label>
            <input type="email" class="form-control" id="un" aria-describedby="emailHelp" v-model="form.username" :disabled="submitDisabled">
            <div id="emailHelp" class="form-text">Email address you received the invite via.</div>
        </div>
        <div class="mb-3">
            <label for="pwd" class="form-label">Password</label>
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
                    username: "",
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
                const { username, password } = this.form;
                this.$emit('submitted', username, password);
            },
        },
    }
</script>