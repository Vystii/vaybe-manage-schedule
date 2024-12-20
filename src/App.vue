<template>
  <div id="app">
    <!-- Table for displaying timeslot and schedules -->
    <div v-if="timeSlots.length > 0">
      <DataTable :value="timeSlots">
        <Column field="time" header="Time">
          <template #body="slotProps">
            {{ slotProps.data.time.start }} - {{ slotProps.data.time.end }}
          </template>
        </Column>
        <Column v-for="day in weekdays" :key="day" :field="day" :header="day">
          <template #body="slotProps">
            <div v-for="description in slotProps.data[day]" :key="description">
              {{ description }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
<script lang="ts">
import ManageSchedules from './components/ManageSchedules.vue'
import { schedules as temp } from './configs'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

interface Schedule {
  id: number
  description: string
  classId: string
  roomId: string
  courseId: string
  startTime: string
  endTime: string
  weekday: string
}

interface Settings {
  id: number
  granularity: number
  pauseDuration: number
}

interface intervalle {
  start: string
  end: string
}

interface TimeSlot {
  time: intervalle
  [key: string]: string[] | intervalle | undefined
}

export default {
  name: 'App',
  components: {
    ManageSchedules,
    DataTable,
    Column,
  },
  data() {
    return {
      schedules: [] as Schedule[],
      settings: null as Settings | null,
      timeSlots: [] as TimeSlot[],
      weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      weekdayMap: {
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
        Sun: 'Sunday',
      } as Record<string, string>,
    }
  },
  methods: {
    buildDataTable() {
      if (!this.settings) return
      const granularity = this.settings.granularity
      const pauseDuration = this.settings.pauseDuration

      const addMinutes = (time: string, minsToAdd: number) => {
        const [hours, minutes] = time.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + minsToAdd
        const newHours = Math.floor(totalMinutes / 60)
          .toString()
          .padStart(2, '0')
        const newMinutes = (totalMinutes % 60).toString().padStart(2, '0')
        return `${newHours}:${newMinutes}`
      }

      const startTime = '8:00'
      const endTimeLimit = '18:00'

      let currentTime = startTime
      const timeSlots: TimeSlot[] = []

      while (parseInt(currentTime.split(':')[0], 10) < 17) {
        // Assuming work hours till 5 PM
        const endTime = addMinutes(currentTime, granularity)
        if (endTime > endTimeLimit) break

        const timeSlot: TimeSlot = {
          time: { start: currentTime, end: endTime } as intervalle,
        } as TimeSlot
        this.weekdays.forEach((day) => (timeSlot[day] = []))

        timeSlots.push(timeSlot)
        currentTime = addMinutes(endTime, pauseDuration)
      }

      this.timeSlots = timeSlots
      console.log('Generated Time Slots:', this.timeSlots)

      // Call generateSchedule after building timeslots
      this.generateSchedule()
    },
    generateSchedule() {
      if (!this.schedules.length || !this.timeSlots.length) return

      this.schedules.forEach((schedule) => {
        const scheduleStart = schedule.startTime
        const fullWeekday = this.weekdayMap[schedule.weekday] // Map abbreviated weekday to full weekday name

        const matchingTimeSlot = this.timeSlots.find((slot) => slot.time.start === scheduleStart)
        if (matchingTimeSlot) {
          if (Array.isArray(matchingTimeSlot[fullWeekday])) {
            matchingTimeSlot[fullWeekday]?.push(schedule.description)
          }
        }
      })

      console.log('Generated Schedule with Timeslots:', this.timeSlots)
    },
    fetchSettings(settingsId: number) {
      axios
        .get(`/scheduling/api/settings/${settingsId}`)
        .then((response) => {
          this.settings = response.data as Settings
          console.log('Settings fetched successfully:', this.settings)
          // Call buildDataTable after fetching settings
          this.buildDataTable()
        })
        .catch((error) => {
          console.error('Error fetching settings:', error)
        })
    },
    fetchSchedules() {
      // Simulate fetching schedules
      this.schedules = temp.map((item) => {
        const startTime = new Date(item.startTime)
        const endTime = new Date(item.endTime)
        const options = { weekday: 'short' as const } // Define options for formatting weekday
        const weekday = startTime.toLocaleDateString(undefined, options).slice(0, 3) // Extract abbreviated weekday
        const startHour = startTime.getHours()
        const startMinute = startTime.getMinutes()
        const endHour = endTime.getHours()
        const endMinute = endTime.getMinutes()

        return {
          id: item.id,
          description: item.description,
          weekday: weekday,
          roomId: item.roomId,
          classId: item.classId,
          startTime: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
          endTime: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
        }
      })

      console.log('Schedules fetched successfully:', this.schedules)
    },
  },
  mounted() {
    this.fetchSettings(1)
    this.fetchSchedules()
  },
}
</script>
