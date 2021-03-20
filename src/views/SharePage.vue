<template>
  <div>
    <sharePage
      :template="body"
      :user="user"
      :campId="campaignId"
      :rewards="rewards"
      :customActions="customActions"
      :referralPoint="referralPoint"
    />
  </div>
</template>

<script>
// @ is an alias to /src
// import axios from 'axios'
import { db } from '@/plugins/firebase'
import { parse } from 'node-html-parser'
import sharePage from '@/components/sharePage'

export default {
  name: 'Home',
  props: {
    campaignId: {
      type: String,
      required: true,
    },
  },
  components: {
    sharePage,
  },
  data() {
    return {
      body: '',
      user: {},
      rewards: [],
      customActions: [],
      referralPoint: 0,
    }
  },
  created() {
    this.getPage()
    this.getLeadInfo()
    this.subDomain = this.getSubdomain(window.location.hostname)
  },
  watch: {
    campaignId(newValue) {
      if (newValue) this.getCampaignInfo()
    },
  },
  computed: {
    lead() {
      return this.$route.params.lead
    },
  },
  methods: {
    getSubdomain(hostname) {
      // eslint-disable-next-line no-useless-escape
      var regexParse = new RegExp('[a-z\-0-9]{2,63}\.[a-z\.]{2,5}$')
      var urlParts = regexParse.exec(hostname)
      return hostname.replace(urlParts[0], '').slice(0, -1)
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
      const reward = root.querySelector('#ifezrp')
      const customAction = root.querySelector('#ipfadj')
      const shareUrl = root.querySelector('#share_url')
      const rewardImage = root.querySelector('.reward-image')
      const actionIcon = root.querySelector('#iembms')

      console.log('This is the html', rawHtml)
      console.log('This is the reward element', reward)

      let newHtml = root.toString()
      const changeElement = ({ oldEl, newEl, element }) => {
        let rawElement
        let newElement
        rawElement = element.toString()
        newElement = rawElement.replace(oldEl, newEl)
        newHtml = newHtml.replace(rawElement, newElement)
      }

      changeElement({
        oldEl: `<div data-deeviral-reward`,
        newEl: `<div v-for="(reward, i) in rewards" :key="i" data-deeviral-reward`,
        element: reward,
      })

      changeElement({
        oldEl: `<div class="reward-image"><img src="https://ucarecdn.com/7410e474-5286-46c1-bb92-2bdea136e617/-/quality/lighter/-/format/auto/null" id="i54vrn"></div>`,
        newEl: `<div class="reward-image"><img :src="reward.image" id="i54vrn"></div>`,
        element: rewardImage,
      })

      changeElement({
        oldEl: `<div data-deeviral-custom-action`,
        newEl: `<div v-for="(action, index) in customActions" :key="index" data-deeviral-custom-action`,
        element: customAction,
      })

      changeElement({
        oldEl: `<input data-deeviral-share-url="share-url" id="share_url" value="https://vy.tc/jiEgf58">`,
        newEl: `<input data-deeviral-share-url="share-url" id="share_url" :value="shareUrl">`,
        element: shareUrl,
      })

      changeElement({
        oldEl: `<i aria-hidden="true" id="iembms" class="fab fa-instagram"></i>`,
        newEl: `<i aria-hidden="true" id="iembms" :style="{color: action.color}" :class="action.icon"></i>`,
        element: actionIcon,
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
          .where('type', '==', 'socialPage')
          .get()

        if (!query.empty) {
          const data = query.docs[0].data()
          // Send page data
          const rawHtml = data.html
          vm.body = `<div>${this.vueCode(rawHtml)}</div>`
          vm.campaignId = data.campaignId
          const style = document.createElement('style')
          style.innerHTML = data.css
          document.head.appendChild(style)
        } else {
          console.log('This page cannot be found')
          vm.body = `<h1>Social Page Not found</h1>`
        }
      } catch (error) {
        console.log(error)
        vm.body = `<h1>There was an error loading this webpage</h1>`
      }
    },
    async getLeadInfo() {
      try {
        const doc = await db
          .collection('leads')
          .doc(this.lead)
          .get()

        if (doc.exists) {
          const data = doc.data()
          // Send page data
          this.user = {
            name: data.firstName || data.email,
            points: data.totalPoints,
            rank: 0,
          }
          console.log('lead Info: ', data)
        } else {
          console.log('This user cannot be found')
        }
      } catch (error) {
        console.log('There was an error getting this lead info', error)
      }
    },
    async getCampaignInfo() {
      let id = this.campaignId
      try {
        const doc = await db
          .collection('campaigns')
          .doc(id)
          .get()

        if (doc.exists) {
          const data = doc.data()
          let rewards = data.rewards.map(reward => {
            return {
              title: reward.name,
              points: reward.requiredPoints,
              description: reward.description,
              image: reward.image.url,
            }
          })

          let customActions = data.contest.settings.customActions.map(
            action => {
              return {
                title: action.actionTitle,
                icon: action.actionIcon,
                description: action.actionDescription,
                url: action.actionUrl,
                color: action.actionColor,
                point: action.actionPoint,
                question: action.actionConfirmationQuestion,
              }
            },
          )

          this.rewards = rewards
          this.customActions = customActions
          this.referralPoint =
            data.contest.settings.pointsForReferralsAndSignUps.referrals
          // Send page data
          console.log('Campaign Info: ', data)
        } else {
          console.log('This campaign cannot be found')
        }
      } catch (error) {
        console.log('There was an error getting this campaign info', error)
      }
    },
  },
}
</script>
