<template>
  <div>
    <leadPage :referredBy="referredBy" :template="body" :campId="campaignId" />
  </div>
</template>

<script>
// @ is an alias to /src
// import axios from 'axios'
import { parse } from 'node-html-parser'
import leadPage from '@/components/leadPage'
import { db } from '@/plugins/firebase'

export default {
  name: 'Home',
  components: {
    leadPage,
  },
  head: {
    title: {
      inner: 'It will be a pleasure',
    },
    // Meta tags
    meta: [
      { name: 'application-name', content: 'Name of my application' },
      { name: 'description', content: 'A description of the page', id: 'desc' }, // id to replace intead of create element
      // ...
      // Twitter
      { name: 'twitter:title', content: 'Content Title' },
      // with shorthand
      {
        n: 'twitter:description',
        c: 'Content description less than 200 characters',
      },
      // ...
      // Google+ / Schema.org
      { itemprop: 'name', content: 'Content Title' },
      { itemprop: 'description', content: 'Content Title' },
      // ...
      // Facebook / Open Graph
      { property: 'og:title', content: 'Deeviral Viral Contest' },
      {
        property: 'og:description',
        content: 'The most comprehensive viral contest online',
      },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: 'https://instagram.devrl.link' },
      {
        property: 'og:image',
        content: 'https://app.truepush.com/assets/images/no_data.jpg',
      },
      // with shorthand
      { p: 'og:image', c: 'https://example.com/image.jpg' },
      // ...
    ],
    // link tags
    link: [
      {
        rel: 'canonical',
        href: 'http://example.com/#!/contact/',
        id: 'canonical',
      },
      { rel: 'author', href: 'author', undo: false }, // undo property - not to remove the element
      {
        rel: 'icon',
        // href: require('./path/to/icon-16.png'),
        sizes: '16x16',
        type: 'image/png',
      },
      // with shorthand
      // { r: 'icon', h: 'path/to/icon-32.png', sz: '32x32', t: 'image/png' },
      // ...
    ],
    script: [
      {
        type: 'text/javascript',
        src: 'cdn/to/script.js',
        async: true,
        body: true,
      }, // Insert in body
      // with shorthand
      { t: 'application/ld+json', i: '{ "@context": "http://schema.org" }' },
      // ...
    ],
    style: [
      {
        type: 'text/css',
        inner: 'body { background-color: #000; color: #fff}',
        undo: false,
      },
      // ...
    ],
  },
  data() {
    return {
      body: '',
      campaignId: '',
      subDomain: '',
    }
  },
  computed: {
    referredBy() {
      return this.getParams(window.location.href).ref
    },
  },
  // mounted() {
  //   this.subDomain = this.getSubdomain(window.location.hostname)
  //   console.log(
  //     'This is the current subdomain name in mounted: ',
  //     this.getSubdomain(window.location.hostname),
  //   )
  //   console.log('This is the domain on vue app in mounted: ', this.subDomain)
  // },
  created() {
    this.subDomain = this.getSubdomain(window.location.hostname)
    console.log(
      'This is the current subdomain name in created: ',
      this.getSubdomain(window.location.hostname),
    )
    console.log('This is the domain on vue app in created: ', this.subDomain)
    this.getPage()
    this.getIp()
  },
  methods: {
    getIp() {
      fetch('https://api.ipify.org?format=json')
        .then(x => x.json())
        .then(res => {
          console.log(`Getting user's ip address: `, res)
        })
    },
    getSubdomain(hostname) {
      let subDomain
      // eslint-disable-next-line no-useless-escape
      var regexParse = new RegExp('[a-z\-0-9]{2,63}\.[a-z\.]{2,5}$')
      var urlParts = regexParse.exec(hostname)
      if (urlParts) {
        hostname.replace(urlParts[0], '').slice(0, -1)
      }
      return subDomain
    },
    // console.log(getSubdomain(window.location.hostname))
    getParams(url) {
      var params = {}
      var parser = document.createElement('a')
      parser.href = url
      var query = parser.search.substring(1)
      var vars = query.split('&')
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        params[pair[0]] = decodeURIComponent(pair[1])
      }
      return params
    },
    // var referredBy = getParams(window.location.href).ref
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
    async getPage() {
      let vm = this
      let subDomain = this.subDomain || 'instagram'
      try {
        const query = await db
          .collection('pages')
          .where('subDomain', '==', subDomain)
          .where('type', '==', 'leadPage')
          .get()

        if (!query.empty) {
          const data = query.docs[0].data()
          console.log('This is the html: ', data)
          const rawHtml = data.html
          vm.body = `<div>${vm.vueCode(rawHtml)}</div>`
          vm.campaignId = data.campaignId
          const style = document.createElement('style')
          style.innerHTML = data.css
          document.head.appendChild(style)
        } else {
          vm.body = `<h1>Page Not found</h1>`
        }
      } catch (error) {
        console.log('There was an error loading the web page', error)
        vm.body = `<h1>There was an error loading this webpage</h1>`
      }
    },
  },
}
</script>
