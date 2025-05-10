<script setup>
import Nav from './components/Nav.vue';
import NotificationManager from './components/NotificationManager.vue';
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <RouterView />
  <Nav></Nav>
  <NotificationManager></NotificationManager>
  <Analytics />
</template>