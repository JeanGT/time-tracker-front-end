<template>
  <div>
    <v-row class="fill-height">
      <v-col>
        <v-row align="center" v-if="isAdmin">
          <v-col>
            <h2 class="text-right">
              Quadro de horas trabalhadas {{ true ? "do" : "" }}
            </h2>
          </v-col>
          <v-col cols="3">
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
          </v-col>
        </v-row>

        <h2 class="text-center" v-if="!isAdmin">Quadro de horas trabalhadas</h2>

        <v-row justify="end">
          <v-col cols="2">
            <v-menu
              v-model="menuInitialDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="initialDate"
                  label="Data inicial"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="initialDate"
                :active-picker.sync="activePickerInitialDate"
                :max="
                  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .substr(0, 10)
                "
                min="1950-01-01"
                locale="pt-br"
              ></v-date-picker>
            </v-menu>
            <div class="v-messages theme--light error--text mb-5">
              {{ initialDateErrors[0] }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-menu
              ref="menuInitialTime"
              v-model="menuInitialTime"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="initialTime"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="initialTime"
                  label="Horário inicial"
                  prepend-icon="mdi-clock-time-four-outline"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="menuInitialTime"
                v-model="initialTime"
                full-width
                @click:minute="$refs.menuInitialTime.save(initialTime)"
              ></v-time-picker>
            </v-menu>
            <div class="v-messages theme--light error--text mb-5">
              {{ initialTimeErrors[0] }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-menu
              v-model="menuFinalDate"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="finalDate"
                  label="Data final"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="finalDate"
                :active-picker.sync="activePickerFinalDate"
                :max="
                  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .substr(0, 10)
                "
                min="1950-01-01"
                locale="pt-br"
              ></v-date-picker>
            </v-menu>
            <div class="v-messages theme--light error--text mb-5">
              {{ finalDateErrors[0] }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-menu
              ref="menuFinalTime"
              v-model="menuFinalTime"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="finalTime"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="finalTime"
                  label="Horário final"
                  prepend-icon="mdi-clock-time-four-outline"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="menuFinalTime"
                v-model="finalTime"
                full-width
                @click:minute="$refs.menuFinalTime.save(finalTime)"
              ></v-time-picker>
            </v-menu>
            <div class="v-messages theme--light error--text mb-5">
              {{ finalTimeErrors[0] }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-btn class="mt-3" @click="manualRegister">
              Cadastrar Manualmente
            </v-btn>
          </v-col>
        </v-row>

        <v-sheet height="64">
          <v-toolbar flat>
            <v-btn
              outlined
              class="mr-4"
              color="grey darken-2"
              @click="setToday"
            >
              Today
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>
            <v-toolbar-title v-if="$refs.calendar">
              {{ $refs.calendar.title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            Clique e arraste para cadastrar!
          </v-toolbar>
        </v-sheet>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :type="type"
          :events="events"
          :event-color="getEventColor"
          :event-ripple="false"
          @mousedown:event="startDrag"
          @click:event="showEvent"
          @mousedown:time="startTime"
          @mousemove:time="mouseMove"
          @mouseup:time="endDrag"
          @mouseleave.native="cancelDrag"
        >
          <template v-slot:event="{ event, timed, eventSummary }">
            <div class="v-event-draggable" v-html="eventSummary()"></div>
            <div
              v-if="timed"
              class="v-event-drag-bottom"
              @mousedown.stop="extendBottom(event)"
            ></div>
          </template>
        </v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card color="grey lighten-4" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn text @click="deleteEvent(selectedEvent.id)">
                <v-icon>mdi-delete</v-icon>Excluir
              </v-btn>
            </v-toolbar>
          </v-card>
        </v-menu>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { Role } from "../utils/role";
import { mapGetters } from "vuex";

export default {
  name: "Timesheets",
  mixins: [validationMixin],

  validations: {
    initialDate: { required },
    finalDate: { required },
    initialTime: { required },
    finalTime: { required },
  },

  data: () => ({
    isAdmin: false,
    employee: null,
    employees: [],
    initialDate: null,
    finalDate: null,
    initialTime: null,
    finalTime: null,
    menuInitialDate: false,
    menuFinalDate: false,
    menuInitialTime: false,
    menuFinalTime: false,
    activePickerInitialDate: null,
    activePickerFinalDate: null,
    focus: "",
    type: "week",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    colors: [
      "#2196F3",
      "#3F51B5",
      "#673AB7",
      "#00BCD4",
      "#4CAF50",
      "#FF9800",
      "#757575",
    ],
    dragEvent: null,
    dragStart: null,
    createEvent: null,
    createStart: null,
    extendOriginal: null,
  }),
  async created() {
    this.isAdmin = this.user.role_id == Role.ADMIN;
    if (this.isAdmin) await this.fetchEmployees();
    else this.employee = this.user.id;
    this.fetchEvents();
  },
  methods: {
    async fetchEmployees() {
      const response = await axios.get("employees");

      this.employees = response.data;
      this.employee = this.employees[0].id;
    },
    async fetchEvents() {
      const response = await axios.get("timesheets", {
        params: {
          employee_id: this.employee,
        },
      });

      const events = [];

      response.data.forEach((event) => {
        events.push({
          name: "Serviço",
          color: this.rndElement(this.colors),
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          timed: true,
          id: event.id,
        });
      });

      this.events = events;
    },
    async saveEvent(start_time, end_time) {
      try {
        const response = await axios.post("timesheets", {
          start_time,
          end_time,
          employee_id: this.employee,
        });

        return response.data.id;
      } catch (error) {
        this.$toast.open({
          message: error.response.data.message,
          type: "error",
        });
      }
    },
    async updateEvent(id, start_time, end_time) {
      try {
        await axios.put(`timesheets/${id}`, {
          start_time,
          end_time,
          employee_id: this.employee,
        });

        this.$toast.open({
          message: "Alterações salvas!",
          type: "success",
        });
      } catch (error) {
        this.$toast.open({
          message: error.response.data.message,
          type: "error",
        });
      }
    },
    async deleteEvent(id) {
      try {
        await axios.delete(`timesheets/${id}`);

        this.events = this.events.filter((event) => event.id != id);
        this.selectedOpen = false;

        this.$toast.open({
          message: "Deletado com sucesso!",
          type: "success",
        });
      } catch (error) {
        this.$toast.open({
          message: error.response.data.message,
          type: "error",
        });
      }
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    startDrag({ event, timed }) {
      if (event && timed) {
        this.dragEvent = event;
        this.dragTime = null;
        this.extendOriginal = null;
      }
    },
    async startTime(tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start;

        this.dragTime = mouse - start;
      } else {
        this.createStart = this.roundTime(mouse);

        const id = await this.saveEvent(
          this.formatDate(this.createStart),
          this.formatDate(this.createStart + 1000)
        );

        if (id) {
          this.createEvent = {
            name: "Serviço",
            color: this.rndElement(this.colors),
            start: this.createStart,
            end: this.createStart,
            timed: true,
            id,
          };

          this.events.push(this.createEvent);
        }
      }
    },
    formatDate(date) {
      date = new Date(
        new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000
      ).toISOString();
      return date.slice(0, 19).replace("T", " ");
    },
    extendBottom(event) {
      this.createEvent = event;
      this.createStart = event.start;
      this.extendOriginal = event.end;
    },
    mouseMove(tms) {
      const mouse = this.toTime(tms);

      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start;
        const end = this.dragEvent.end;
        const duration = end - start;
        const newStartTime = mouse - this.dragTime;
        const newStart = this.roundTime(newStartTime);
        const newEnd = newStart + duration;

        this.dragEvent.start = newStart;
        this.dragEvent.end = newEnd;
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        this.createEvent.start = min;
        this.createEvent.end = max;
      }
    },
    endDrag() {
      const id = this.createEvent ? this.createEvent.id : this.dragEvent.id;

      const event = this.events.find((event) => event.id == id);

      this.updateEvent(
        id,
        this.formatDate(event.start),
        this.formatDate(event.end + 1000)
      );

      this.dragTime = null;
      this.dragEvent = null;
      this.createEvent = null;
      this.createStart = null;
      this.extendOriginal = null;
    },
    cancelDrag() {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal;
        } else {
          const i = this.events.indexOf(this.createEvent);
          if (i !== -1) {
            this.events.splice(i, 1);
          }
        }
      }

      this.createEvent = null;
      this.createStart = null;
      this.dragTime = null;
      this.dragEvent = null;
    },
    roundTime(time, down = true) {
      const roundTo = 15; // minutes
      const roundDownTime = roundTo * 60 * 1000;

      return down
        ? time - (time % roundDownTime)
        : time + (roundDownTime - (time % roundDownTime));
    },
    toTime(tms) {
      return new Date(
        tms.year,
        tms.month - 1,
        tms.day,
        tms.hour,
        tms.minute
      ).getTime();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    getEventColor(event) {
      const rgb = parseInt(event.color.substring(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      return event === this.dragEvent
        ? `rgba(${r}, ${g}, ${b}, 0.7)`
        : event === this.createEvent
        ? `rgba(${r}, ${g}, ${b}, 0.7)`
        : event.color;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    rndElement(arr) {
      return arr[this.rnd(0, arr.length - 1)];
    },
    async manualRegister() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        const start_date = this.initialDate + " " + this.initialTime;
        const final_date = this.finalDate + " " + this.finalTime;
        const id = await this.saveEvent(start_date, final_date);

        if (id) {
          this.events.push({
            name: "Serviço",
            color: this.rndElement(this.colors),
            start: new Date(start_date),
            end: new Date(final_date),
            timed: true,
            id: id,
          });

          this.initialDate = null;
          this.initialTime = null;
          this.finalDate = null;
          this.finalTime = null;
          this.$v.$reset();
        }
      }
    },
  },
  watch: {
    menuInitialDate(val) {
      val && setTimeout(() => (this.activePickerInitialDate = "YEAR"));
    },
    menuFinalDate(val) {
      val && setTimeout(() => (this.activePickerFinalDate = "YEAR"));
    },
    employee() {
      this.fetchEvents();
    },
  },
  computed: {
    ...mapGetters(["user"]),
    initialDateErrors() {
      const errors = [];
      if (!this.$v.initialDate.$dirty) return errors;
      !this.$v.initialDate.required && errors.push("Selecione uma data");
      return errors;
    },
    initialTimeErrors() {
      const errors = [];
      if (!this.$v.initialTime.$dirty) return errors;
      !this.$v.initialTime.required && errors.push("Selecione um horário");
      return errors;
    },
    finalDateErrors() {
      const errors = [];
      if (!this.$v.finalDate.$dirty) return errors;
      !this.$v.finalDate.required && errors.push("Selecione uma data");
      return errors;
    },
    finalTimeErrors() {
      const errors = [];
      if (!this.$v.finalTime.$dirty) return errors;
      !this.$v.finalTime.required && errors.push("Selecione um horário");
      return errors;
    },
  },
};
</script>

<style scoped lang="scss">
.v-event-draggable {
  padding-left: 6px;
}

.v-event-timed {
  user-select: none;
  -webkit-user-select: none;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;

  &::after {
    display: none;
    position: absolute;
    left: 50%;
    height: 4px;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    width: 16px;
    margin-left: -8px;
    opacity: 0.8;
    content: "";
  }

  &:hover::after {
    display: block;
  }
}
</style>