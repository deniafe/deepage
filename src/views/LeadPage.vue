<template>
  <div>
    <leadPage :template="body" />
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios'
import { parse } from 'node-html-parser'
import leadPage from '@/components/leadPage'

export default {
  name: 'Home',
  components: {
    leadPage,
  },
  data() {
    return {
      body: '',
    }
  },
  created() {
    this.getPage()
  },
  methods: {
    vueCode(rawHtml) {
      const root = parse(rawHtml)
      const inputs = root.querySelectorAll('input')
      const buttons = root.querySelectorAll('.button')
      const forms = root.querySelectorAll('form')

      let newHtml = root.toString()
      const changeElement = ({ oldEl, newEl, elements }) => {
        let rawElement
        let newElement
        elements.forEach(element => {
          rawElement = element.toString()
          newElement = rawElement.replace(oldEl, newEl)
          newHtml = newHtml.replace(rawElement, newElement)
        })
      }

      changeElement({
        oldEl: '<input ',
        newEl: '<input v-model="form.email" ',
        elements: inputs,
      })

      changeElement({
        oldEl: '<a href="#" class="button w-button">',
        newEl: '<a @click.stop="save" class="button w-button">',
        elements: buttons,
      })

      changeElement({
        oldEl: '<form ',
        newEl: '<form @submit.prevent="save" ',
        elements: forms,
      })

      return newHtml
    },
    getPage() {
      let vm = this
      axios
        .get(
          'https://us-central1-deeviral-c24fe.cloudfunctions.net/api/pagebody/bUWbvuiRcKgou16grstw',
        )
        .then(function(response) {
          const rawHtml = response.data.html
          vm.body = `<div>${vm.vueCode(rawHtml)}</div>`
          const style = document.createElement('style')
          style.innerHTML = response.data.css
          document.head.appendChild(style)
        })
        .catch(function(error) {
          console.log('There was an error loading the web page', error)
        })
    },
  },
}
</script>
