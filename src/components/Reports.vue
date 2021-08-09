<template>
  <div>
    <v-container>
      <v-row justify="center">
        <h2 class="text-center mb-12">Relatório Pessoal</h2>
        <v-col cols="4">
          <v-card class="px-8" elevation="7" height="600">
            <v-card-title>
              <h4 class="mx-auto">Total de horas</h4>
            </v-card-title>
            <p v-if="total_hours">
              Total:
              <b>{{ total_hours }}</b>
            </p>
            <p v-if="!total_hours">
              Nenhum registro encontrado nesse período...
            </p>
            <p>Filtrar:</p>
            <v-date-picker
              v-model="date_interval"
              range
              :selected-items-text="smallerDateFilter + ' à ' + biggerDateFilter"
              locale="pt-br"
              color="purple darken-2"
              full-width
            ></v-date-picker>
            <v-btn @click="clear" color="error"> Limpar </v-btn>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card class="px-8" elevation="7" height="600">
            <v-card-title>
              <h4 class="mx-auto">Meus Recibos</h4>
            </v-card-title>
            <p class="text-center" v-if="!hasReceipt">
              Você não tem nenhum recibo... Peça para algum administrador gerar
              um.
            </p>
            <v-btn v-if="hasReceipt" block class="my-5" @click="getDuplicate()"
              >Gerar segunda via</v-btn
            >
            <v-date-picker
              v-if="hasReceipt"
              v-model="referring_month"
              type="month"
              required
              color="purple darken-2"
              locale="pt-br"
              full-width
              :error-messages="monthErrors"
              :allowed-dates="isInAllowedMonths"
              @input="$v.referring_month.$touch()"
              @blur="$v.referring_month.$touch()"
            ></v-date-picker>
            <div class="v-messages theme--light error--text mb-5">
              {{ monthErrors[0] }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { inFullHours } from "../utils/inFull";

export default {
  name: "Reports",
  mixins: [validationMixin],

  validations: {
    referring_month: { required },
  },

  data: () => ({
    date_interval: [],
    total_hours: null,
    referring_month: null,
    allowed_months: [],
  }),
  methods: {
    async fetchAllowedMonths() {
      const response = await axios.get("receipts");

      this.allowed_months = response.data.map((receipt) =>
        receipt.referring_month.slice(0, -3)
      );
    },
    async fetchTotalHours() {
      let max_end_date = null;
      if (this.biggerDateFilter) {
        max_end_date = new Date(this.biggerDateFilter);
        max_end_date.setDate(max_end_date.getDate() + 2);
        max_end_date =
          max_end_date.getFullYear() +
          "-" +
          (max_end_date.getMonth() + 1) +
          "-" +
          max_end_date.getDate();
      }

      const response = await axios.get("total_hours", {
        params: {
          min_start_date: this.smallerDateFilter,
          max_end_date,
        },
      });

      if (response.data.total_hours)
        this.total_hours = inFullHours(response.data.total_hours);
      else this.total_hours = null;
    },
    async getDuplicate() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        const form_data = {
          referring_month: this.formatMonth(this.referring_month),
        };

        const response = await axios({
          url: "duplicate",
          method: "GET",
          responseType: "blob",
          params: form_data,
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Recibo Prestador - Segunda Via.pdf");
        document.body.appendChild(link);
        link.click();
        this.submitStatus = "";
      }
    },
    isInAllowedMonths(val) {
      return this.allowed_months.includes(val);
    },
    formatMonth(month) {
      return month + "-01 00:00:00";
    },
    clear() {
      this.date_interval = [];
    },
  },
  computed: {
    monthErrors() {
      const errors = [];
      if (!this.$v.referring_month.$dirty) return errors;
      !this.$v.referring_month.required && errors.push("Selecione um mês");
      return errors;
    },
    hasReceipt() {
      return this.allowed_months.length > 0;
    },
    smallerDateFilter() {
      if (!this.date_interval[0]) return null;

      if (!this.date_interval[1]) return this.date_interval[0];

      return new Date(this.date_interval[0]) <= new Date(this.date_interval[1])
        ? this.date_interval[0]
        : this.date_interval[1];
    },
    biggerDateFilter() {
      if (!this.date_interval[1]) return null;

      return new Date(this.date_interval[1]) >= new Date(this.date_interval[0])
        ? this.date_interval[1]
        : this.date_interval[0];
    },
  },
  watch: {
    date_interval: function () {
      this.fetchTotalHours();
    },
  },
  created() {
    this.fetchTotalHours();
    this.fetchAllowedMonths();
  },
};
</script>
