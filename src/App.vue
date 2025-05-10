<script setup>
import Nav from './components/Nav.vue';
import NotificationManager from './components/NotificationManager.vue';
import { Analytics } from "@vercel/analytics/next"
</script>

<template>
  <RouterView />
  <Nav></Nav>
  <NotificationManager></NotificationManager>
</template>