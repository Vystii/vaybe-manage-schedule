<template>
  <div v-if="!hasError" class="app-table-container">
    <!-- Table for displaying timeslot and schedules -->
    <div v-if="!loading" class="table-content">
      <div v-if="timeSlots.length > 0">
        <DataTable :value="timeSlots">
          <Column field="time" header="Time">
            <template #body="slotProps">
              <div class="py-5">
                {{ slotProps.data.time.start }} - {{ slotProps.data.time.end }}
              </div>
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
      <div v-else class="loader"></div>
      <!-- Dialog for showing course details -->
      <Dialog v-model:visible="dialogVisible" modal>
        <template v-if="dialogData.length === 1">
          <div class="model-content space-inner-px space-inner-py pt-5">
            <h2>{{ dialogData[0].title }}</h2>
            <div class="d-flex w-min-20 py-3 justify-content-between modal-content-row">
              <span class="fw-bold">Room:</span> <span>{{ dialogData[0].roomId }}</span>
            </div>
            <div class="d-flex w-min-20 py-3 justify-content-between modal-content-row">
              <span class="fw-bold">Class:</span> <span>{{ dialogData[0].classId }}</span>
            </div>
            <!-- ajout d'un bouton -->

            <button
              class="btn btn-primary d-block mx-auto text-white fw-bolder px-5 border-radius-10 mt-5"
              v-if="course_url"
              @click="openCourse(dialogData[0].courseId)"
            >
              see more
            </button>
          </div>
        </template>
        <template v-else>
          <div v-for="course in dialogData" :key="course.id" @click="openDialog([course])">
            <h2>{{ course.title }}</h2>
          </div>
        </template>
      </Dialog>
    </div>
  </div>
  <div
    v-else
    class="error-panel h-min-25 bg-warning-subtle d-flex align-items-center justify-content-center"
  >
    <div class="fw-bold fs-3">
      <span> Something went wrong </span>
    </div>
  </div>
</template>

<script lang="ts">
// import ManageSchedules from './components/ManageSchedules.vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

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
    schedule_source: {
      type: Object,
      default: '/scheduling/api/schedules',
    },
    course_url: {
      type: String,
      default: '/course-manager/course/[id]',
    },
    csrf_token: {
      type: String,
      required: true,
    },
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
      hasError: false,
      loading: true,
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

      // Call generateSchedule after building timeslots
      this.generateSchedule()
    },
    openCourse(id: string) {
      //replace [id] in course_url with the id of the course
      const url = this.course_url.replace('[id]', id)
      window.location.href = url
    },
    generateSchedule() {
      if (!this.schedules.length || !this.timeSlots.length) return

      this.schedules.forEach((schedule: Schedule) => {
        console.log('a schedule: ', schedule)
        const scheduleStart = schedule.startTime
        const fullWeekday = this.weekdayMap[schedule.weekday!] // Map abbreviated weekday to full weekday name

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
    },
    fetchSettings(settingsId: number) {
      axios
        .get(`/scheduling/api/settings/${settingsId}`)
        .then((response) => {
          this.settings = response.data as Settings
          // console.log('django Settings successfully:', response.data)
          // Call buildDataTable after fetching settings
          this.fetchSchedules()
        })
        .catch((error) => {
          console.error('Error fetching settings:', error)
          this.hasError = true
        })
    },
    fetchSchedules() {
      // console.log('fecteching schedules', this.schedule_source.url)
      axios
        .post(
          this.schedule_source.url,
          { course_ids: this.schedule_source.body },
          {
            headers: {
              'X-CSRFToken': this.csrf_token,
            },
          },
        )
        .then((response) => {
          this.loading = false
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
          this.buildDataTable()
        })
        .catch((error) => {
          console.log('something went wrong', error)
          this.hasError = true
        })
    },
    openDialog(data: SlotProp[]) {
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
    // this.fetchSchedules()
  },
}
</script>
<style scoped>
.error-panel {
  min-height: 25rem;
}
</style>
