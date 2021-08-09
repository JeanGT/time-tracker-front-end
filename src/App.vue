<template>
  <v-app id="inspire">
    <v-navigation-drawer v-if="user" v-model="drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            {{ user.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ user.role_id == role.USER ? "Prestador" : "Administrador" }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.to" link>
          <v-list-item-icon>
            <v-icon color="purple darken-3">{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block dark @click="logout" color="purple darken-3">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar dark prominent app color="purple darken-3">
      <v-app-bar-nav-icon
        v-if="user"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title><h2>Teste técnico - Intergalaxy</h2></v-toolbar-title>
    </v-app-bar>

    <v-main>
      <div class="pa-8">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import { Role } from "./utils/role.js";

export default {
  data: () => ({
    drawer: null,
    role: Role,
  }),
  methods: {
    logout() {
      localStorage.removeItem("token");

      this.$store.dispatch("user", null);
      this.$router.push("/auth");
    },
  },
  computed: {
    ...mapGetters(["user"]),
    items() {
      if (this.user) {
        const routes = [
          {
            title: "Quadro de horas",
            icon: "mdi-clock-outline",
            to: "/timesheets",
          },
        ];
        if (this.user.role_id == this.role.USER) {
          return routes.concat([
            { title: "Relatórios", icon: "mdi-chart-box", to: "/reports" },
          ]);
        } else {
          return [
            {
              title: "Dashboard",
              icon: "mdi-view-dashboard",
              to: "/dashboard",
            },
            {
              title: "Recibo Prestador",
              icon: "mdi-receipt",
              to: "/receipts",
            },
          ].concat(routes);
        }
      }
      return null;
    },
  },
};
</script>