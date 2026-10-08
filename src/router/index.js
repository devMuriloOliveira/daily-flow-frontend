import { createRouter, createWebHistory } from "vue-router";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";
import CreateTaskView from "../views/CreateTaskView.vue";
import StatisticsView from "../views/StatisticsView.vue";
import AgendaView from "../views/AgendaView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/register",
    component: RegisterView,
  },
  {
    path: "/dashboard",
    component: DashboardView,
  },
  {
    path: "/create-task",
    component: CreateTaskView,
  },
  {
    path: "/edit-task/:id",
    component: CreateTaskView,
  },
  {
    path: "/statistics",
    component: StatisticsView,
  },
  {
    path: "/agenda",
    component: AgendaView,
  },
  {
    path: "/settings",
    component: SettingsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
