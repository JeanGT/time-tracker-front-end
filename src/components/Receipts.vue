<template>
  <div>
    <v-card
      class="px-8 mx-auto"
      elevation="7"
      max-width="500"
      :loading="submit_status == 'PENDING'"
    >
      <v-container>
        <v-row>
          <v-col>
            <v-card-title>
              <h2 class="mx-auto">Gerar Recibo</h2>
            </v-card-title>
            <form v-on:keyup.enter="onSubmit">
              <p>
                Prestador:
                <v-autocomplete
                  clearable
                  rounded
                  solo
                  required
                  class="mt-3"
                  item-text="name"
                  item-value="id"
                  v-model="employee_id"
                  :items="employees"
                  :error-messages="employeeErrors"
                  @input="$v.employee_id.$touch()"
                  @blur="$v.employee_id.$touch()"
                ></v-autocomplete>
              </p>
              <p>Mês:</p>
              <v-date-picker
                v-model="referring_month"
                type="month"
                required
                color="purple darken-2"
                locale="pt-br"
                full-width
                :error-messages="monthErrors"
                @input="$v.referring_month.$touch()"
                @blur="$v.referring_month.$touch()"
              ></v-date-picker>
              <div class="v-messages theme--light error--text mb-5">
                {{ monthErrors[0] }}
              </div>

              <v-btn block @click="onSubmit"> Confirmar </v-btn>
            </form>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-1">
          Esse recibo já foi gerado
        </v-card-title>

        <v-card-text>
          <div class="py-5 text-body-1">
            Você ou algum outro administrador já gerou um recibo para essa
            pessoa nesse mês. <br />
            Tem certeza que deseja gerar novamente?
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="generateReceipt()">
            Gerar recibo novamente
          </v-btn>
          <v-btn color="primary" text @click="generateReceipt(true)">
            Baixar segunda via
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "Receipts",
  mixins: [validationMixin],

  validations: {
    employee_id: { required },
    referring_month: { required },
  },

  data: () => ({
    employees: [],
    submit_status: "",
    employee_id: null,
    referring_month: null,
    dialog: false,
  }),
  computed: {
    employeeErrors() {
      const errors = [];
      if (!this.$v.employee_id.$dirty) return errors;
      !this.$v.employee_id.required && errors.push("Selecione um prestador");
      return errors;
    },
    monthErrors() {
      const errors = [];
      if (!this.$v.referring_month.$dirty) return errors;
      !this.$v.referring_month.required && errors.push("Selecione um mês");
      return errors;
    },
  },
  methods: {
    async fetchEmployees() {
      const response = await axios.get("employees");

      this.employees = response.data;
    },
    async onSubmit() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (await this.checkIfReceiptExists()) {
          this.dialog = true;
        } else {
          this.generateReceipt();
        }
      }
    },
    async checkIfReceiptExists() {
      const response = await axios.get("generated_receipts", {
        params: {
          employee_id: this.employee_id,
          referring_month: this.formatMonth(this.referring_month),
        },
      });

      return response.data.length > 0;
    },
    async generateReceipt(isDuplicate) {
      this.dialog = false;
      this.submit_status = "PENDING";

      try {
        const form_data = {
          employee_id: this.employee_id,
          referring_month: this.formatMonth(this.referring_month),
        };

        const response = await axios({
          url: isDuplicate ? "duplicate" : "receipts",
          method: isDuplicate ? "GET" : "POST",
          responseType: "blob",
          params: form_data,
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isDuplicate
            ? "Recibo Prestador - Segunda Via.pdf"
            : "Recibo Prestador.pdf"
        );
        document.body.appendChild(link);
        link.click();
        this.submit_status = "";
      } catch (e) {
        this.submit_status = "";
        this.$toast.open({
          message: "Não foi encontrado nenhum registro desse prestador nesse mês",
          type: "error",
        });
      }
    },
    formatMonth(month) {
      return month + "-01 00:00:00";
    },
  },
  created() {
    this.fetchEmployees();
  },
};
</script>
