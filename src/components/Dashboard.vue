<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="4">
          <v-card class="px-8" elevation="7">
            <v-card-title>
              <h2 class="mx-auto">Filtros</h2>
            </v-card-title>
            <p>
              Prestador:
              <v-autocomplete
                clearable
                rounded
                solo
                class="mt-3"
                item-text="name"
                item-value="id"
                v-model="employee"
                :items="employees"
              ></v-autocomplete>
            </p>
            <p>Data:</p>
            <v-date-picker
              v-model="date_interval"
              range
              color="purple darken-2"
              locale="pt-br"
              :selected-items-text="smallerDateFilter + ' à ' + biggerDateFilter"
              full-width
            >
            </v-date-picker>
            <v-btn class="ml-auto mb-5" @click="clear" color="error">
              Limpar
            </v-btn>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="px-8 pb-10" elevation="7">
            <v-card-title>
              <h2 class="mx-auto">Resultado</h2>
            </v-card-title>
            <v-row>
              <h4 v-if="total_hours">
                Total:
                <b>{{ total_hours }}</b>
              </h4>
              <h3 v-if="!total_hours">Nenhum registro encontrado...</h3>
              <v-sparkline
                :value="timesheets"
                :gradient="['purple', 'violet']"
                smooth="10"
                padding="8"
                line-width="2"
                stroke-linecap="round"
                gradient-direction="top"
                type="trend"
                auto-draw
              >
              </v-sparkline>
            </v-row>
            <v-row>
              <v-col>
                <h5 v-if="first_timesheet_date">
                  Primeiro registro: <b>{{ first_timesheet_date }}</b>
                </h5>
              </v-col>
              <v-col v-if="last_timesheet_date">
                <h5 class="text-right">
                  Último registro: <b>{{ last_timesheet_date }}</b>
                </h5>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import { inFullHours } from "../utils/inFull";

export default {
  name: "Dashboard",
  data: () => ({
    timesheets: [1, 1],
    employee: null,
    employees: [],
    date_interval: [],
    total_hours: null,
    first_timesheet_date: null,
    last_timesheet_date: null,
  }),
  methods: {
    async fetchEmployees() {
      const response = await axios.get("employees");

      this.employees = response.data;
    },
    async fetchTotalHours() {
      const response = await axios.get("total_hours", {
        params: {
          employee_id: this.employee,
          min_start_date: this.smallerDateFilter,
          max_end_date: this.formatEndDate(this.biggerDateFilter),
        },
      });

      if (response.data.total_hours)
        this.total_hours = inFullHours(response.data.total_hours);
      else this.total_hours = null;
    },
    async fetchTimesheets() {
      const response = await axios.get("timesheets_durations", {
        params: {
          employee_id: this.employee,
          min_start_date: this.smallerDateFilter,
          max_end_date: this.formatEndDate(this.biggerDateFilter),
        },
      });

      if (response.data.length > 0) {
        this.first_timesheet_date = new Date(response.data[0].start_time);
        this.last_timesheet_date = new Date(
          response.data[response.data.length - 1].end_time
        );

        this.first_timesheet_date =
          this.first_timesheet_date.getDate() +
          "/" +
          (this.first_timesheet_date.getMonth() + 1);
        this.last_timesheet_date =
          this.last_timesheet_date.getDate() +
          "/" +
          (this.last_timesheet_date.getMonth() + 1);

        this.timesheets = response.data.map((timehseet) =>
          parseFloat(timehseet.hours)
        );
      } else {
        this.first_timesheet_date = null;
        this.last_timesheet_date = null;
        this.timesheets = [1, 1];
      }
    },
    formatEndDate(end_date) {
      if (!end_date) return null;

      const formated_end_date = new Date(end_date);
      formated_end_date.setDate(formated_end_date.getDate() + 2);
      return (
        formated_end_date.getFullYear() +
        "-" +
        (formated_end_date.getMonth() + 1) +
        "-" +
        formated_end_date.getDate()
      );
    },
    clear() {
      this.date_interval = [];
      this.employee = null;
    },
  },
  computed: {
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
      this.fetchTimesheets();
    },
    employee: function () {
      this.fetchTotalHours();
      this.fetchTimesheets();
    },
  },
  created() {
    this.fetchEmployees();
    this.fetchTotalHours();
    this.fetchTimesheets();
  },
};
</script>
