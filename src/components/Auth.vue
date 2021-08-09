<template>
  <div>
    <v-card
      elevation="3"
      outlined
      shaped
      class="mx-auto my-12 pa-6"
      max-width="1000"
      :loading="submit_status == 'PENDING'"
    >
      <v-container>
        <v-row>
          <v-col>
            <v-img contain src="../assets/login.png" max-width="480"></v-img>
          </v-col>
          <v-col>
            <form v-on:keyup.enter="onSubmit">
              <div v-if="register">
                <h2>Cadastro</h2>

                <div class="text-right">
                  Valor da hora de trabalho: R$
                  {{ form_data.hourly_price.toFixed(2) }}
                </div>
                <v-slider
                  v-model="form_data.hourly_price"
                  label=""
                  max="200"
                  min="1"
                  step="0.5"
                ></v-slider>
                <v-text-field
                  v-model="form_data.name"
                  label="Nome"
                  required
                  @input="$v.form_data.name.$touch()"
                  @blur="$v.form_data.name.$touch()"
                  :error-messages="nameErrors"
                ></v-text-field>
                <v-text-field
                  v-model="form_data.cpf"
                  label="CPF"
                  v-mask="'###.###.###-##'"
                  required
                  @input="$v.form_data.cpf.$touch()"
                  @blur="$v.form_data.cpf.$touch()"
                  :error-messages="cpfErrors"
                ></v-text-field>
              </div>
              <div v-if="!register">
                <h2>Login</h2>
                <p>Seja bem vindo! Por favor, realize o login.</p>
              </div>

              <v-text-field
                v-model="form_data.email"
                :error-messages="emailErrors"
                label="Email"
                required
                @input="$v.form_data.email.$touch()"
                @blur="$v.form_data.email.$touch()"
              ></v-text-field>
              <v-text-field
                v-model="form_data.password"
                :error-messages="passwordErrors"
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                label="Senha"
                required
                @input="$v.form_data.password.$touch()"
                @blur="$v.form_data.password.$touch()"
                @click:append="show = !show"
              ></v-text-field>

              <v-btn class="mr-4 my-5" @click="clear" color="error">
                Limpar
              </v-btn>

              <v-btn @click="onSubmit">
                {{ register ? "Cadastrar" : "Entrar" }}
              </v-btn>

              <br />

              <a @click="register = !register">
                {{ register ? "Já tem uma conta?" : "Ainda não é cadastrado?" }}
              </a>
            </form>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  name: "Auth",
  mixins: [validationMixin],

  validations: {
    form_data: {
      name: { required },
      cpf: { required },
      email: { required, email },
      password: { required },
    },
  },

  data() {
    return {
      register: false,
      submit_status: "",
      show: false,
      form_data: {
        hourly_price: 1,
        name: "",
        cpf: "",
        email: "",
        password: "",
      },
    };
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.form_data.name.$dirty) return errors;
      !this.$v.form_data.name.required && errors.push("O nome é obrigatório");
      return errors;
    },
    cpfErrors() {
      const errors = [];
      if (!this.$v.form_data.cpf.$dirty) return errors;
      !this.$v.form_data.cpf.required && errors.push("O cpf é obrigatório");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.form_data.email.$dirty) return errors;
      !this.$v.form_data.email.email && errors.push("Digite um email válido");
      !this.$v.form_data.email.required && errors.push("O email é obrigatório");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.form_data.password.$dirty) return errors;
      !this.$v.form_data.password.required &&
        errors.push("A senha é obrigatória");
      return errors;
    },
  },
  methods: {
    async onSubmit() {
      this.$v.$touch();

      if (!this.register || !this.$v.$invalid) {
        this.submit_status = "PENDING";

        try {
          const response = await axios.post(
            "auth/" + (this.register ? "register" : "login"),
            this.form_data
          );
          setTimeout(() => {
            localStorage.setItem("token", response.data.token);

            this.$store.dispatch("user", response.data.user);
            this.submit_status = "";
            this.$router.push("/");
          }, 500);
        } catch (error) {
          this.submit_status = "";

          if (this.register) {
            const errors = error.response.data;
            for (let e in errors) {
              this.$toast.open({
                message: errors[e][0],
                type: "error",
              });
            }
          } else {
            this.$toast.open({
              message: "Email ou senha inválidos",
              type: "error",
            });
          }
        }
      }
    },
    clear() {
      this.$v.$reset();
      this.form_data.hourly_price = 1;
      this.form_data.name = "";
      this.form_data.cpf = "";
      this.form_data.email = "";
      this.form_data.password = "";
    },
  },
};
</script>