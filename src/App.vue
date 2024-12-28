<template>
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
          <div
            v-if="slotProps.data[day] && slotProps.data[day].length > 0"
            @click="openDialog(slotProps.data[day])"
          >
            <div v-for="cell_schedule in slotProps.data[day]" :key="cell_schedule.id">
              {{ cell_schedule.description }}
            </div>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <!-- Dialog for showing course details -->
  <Dialog v-model:visible="dialogVisible" modal>
    <template v-if="dialogData.length === 1">
      <h2>{{ dialogData[0].title }}</h2>
      <p><strong>Room:</strong> {{ dialogData[0].roomId }}</p>
      <p><strong>Class:</strong> {{ dialogData[0].classId }}</p>
    </template>
    <template v-else>
      <div v-for="course in dialogData" :key="course.id" @click="openDialog([course])">
        <h2>{{ course.title }}</h2>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
// import ManageSchedules from './components/ManageSchedules.vue'
import { schedules as temp } from './configs'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import type { Slot } from 'vue'
import { idText } from 'typescript'

interface Schedule {
  id: number | string
  title: string
  description: string
  classId: string
  roomId: string
  courseId: string
  startTime: string
  endTime: string
  weekday?: string
}

interface Room {
  id: string
  name: string
  capacity: number
}

interface DBSchedule {
  id: number | string
  title: string
  description: string
  presentation: string
  classId: string
  room: Room
  courseId: string
  timeSlot: { startTime: string; endTime: string; dayOfWeek: number }
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

interface SlotProp {
  id: string
  description: string
}
interface TimeSlot {
  time: intervalle
  [key: string]: SlotProp[] | intervalle | undefined
}

export default {
  name: 'App',
  props: {
    schedule_source: String,
    course_url: String,
  },
  components: {
    // ManageSchedules,
    DataTable,
    Column,
    Dialog,
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
      dialogVisible: false,
      dialogData: [] as Schedule[],
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
            matchingTimeSlot[fullWeekday]?.push({
              description: schedule.description,
              id: schedule.id.toString(),
            })
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
          console.log('django Settings successfully:', response.data)
          // Call buildDataTable after fetching settings
          this.buildDataTable()
        })
        .catch((error) => {
          console.error('Error fetching settings:', error)
        })
    },
    fetchSchedules() {
      console.log('fecteching schedules', this.schedule_source)
      axios.get(this.schedule_source).then((response) => {
        // this.schedules = response.data
        // Simulate fetching schedules
        console.log('reponse: ', response)
        this.schedules = response.data.map((item: DBSchedule) => {
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const startTime = new Date(item.timeSlot.startTime)
          const endTime = new Date(item.timeSlot.endTime)
          // const options = { weekday: 'short' as const } // Define options for formatting weekday
          const weekday = weekdays[item.timeSlot.dayOfWeek] // Extract abbreviated weekday
          const startHour = startTime.getHours()
          const startMinute = startTime.getMinutes()
          const endHour = endTime.getHours()
          const endMinute = endTime.getMinutes()

          return {
            id: item.id,
            title: item.title,
            description: item.title,
            weekday: weekday,
            courseId: item.courseId,
            roomId: item.room.id,
            classId: item.classId,
            startTime: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
            endTime: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
          }
        })
        console.log('Schedules django successfully:', this.schedules)
      })
      // Simulate fetching schedules
      // this.schedules = temp.map((item: Schedule) => {
      //   const startTime = new Date(item.startTime)
      //   const endTime = new Date(item.endTime)
      //   const options = { weekday: 'short' as const } // Define options for formatting weekday
      //   const weekday = startTime.toLocaleDateString(undefined, options).slice(0, 3) // Extract abbreviated weekday
      //   const startHour = startTime.getHours()
      //   const startMinute = startTime.getMinutes()
      //   const endHour = endTime.getHours()
      //   const endMinute = endTime.getMinutes()

      //   return {
      //     id: item.id,
      //     title: item.title,
      //     description: item.description,
      //     weekday: weekday,
      //     roomId: item.roomId,
      //     classId: item.classId,
      //     startTime: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
      //     endTime: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
      //   }
      // })

      // console.log('Schedules fetched successfully:', this.schedules)
    },
    openDialog(data: SlotProp[]) {
      console.log(data)
      this.dialogData = this.schedules.filter((schedule) => {
        let found = false
        let i = 0
        while (i < data.length && !found) {
          if (Number(data[i].id) == schedule.id) {
            found = true
          }
          ++i
        }
        return found
      })
      this.dialogVisible = true
    },
    closeDialog() {
      alert('closing')
      this.dialogVisible = false
      this.dialogData = []
    },
  },
  mounted() {
    this.fetchSettings(1)
    this.fetchSchedules()
  },
}
</script>
