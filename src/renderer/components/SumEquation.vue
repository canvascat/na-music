<template>
  <n-space align="center" style="justify-content: center;">
    <n-button @click="one++">{{ one }}</n-button> +
    <n-button @click="two++">{{ two }}</n-button> =
    <n-button @click="one = 0; two = 0">{{ sum }}</n-button>
  </n-space>
</template>

<script lang=ts setup>
/* eslint-disable no-unused-vars */
import { ref } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import { useSum } from '../hooks'

const one = ref(0)
const two = ref(0)
const sum = useSum(one, two)
</script>

<style>
</style>
