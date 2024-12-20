<template>
  <div>
    <h1>Manage Schedules</h1>
    <form @submit.prevent="addSchedule">
      <label>Title:</label>
      <input v-model="newSchedule.title" required />
      <label>Description:</label>
      <input v-model="newSchedule.description" required />
      <label>Class:</label>
      <select v-model="newSchedule.classId" required>
        <option v-for="classe in classes" :key="classe.id" :value="classe.id">
          {{ classe.name }}
        </option>
      </select>
      <label>Course:</label>
      <select v-model="newSchedule.courseId" required>
        <option v-for="course in courses" :key="course.id" :value="course.id">
          {{ course.name }}
        </option>
      </select>
      <label>Room:</label>
      <select v-model="newSchedule.roomId" required>
        <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
      </select>
      <button type="submit">Add Schedule</button>
    </form>
    <ul>
      <li v-for="schedule in schedules" :key="schedule.id">
        {{ schedule.title }} - {{ schedule.description }}
        <button @click="deleteSchedule(schedule.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ManageSchedules',
  data() {
    return {
      schedules: [],
      newSchedule: {
        title: '',
        description: '',
        classId: '',
        roomId: '',
        courseId: '',
      },
      classes: [],
      courses: [],
      rooms: [],
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      axios.get('/api/school-classes/').then((response) => {
        this.classes = response.data
      })
      axios.get('/api/courses/').then((response) => {
        this.courses = response.data
      })
      axios.get('/api/rooms/').then((response) => {
        this.rooms = response.data
      })
      axios.get('/api/schedules/').then((response) => {
        this.schedules = response.data
      })
    },
    addSchedule() {
      axios.post('/api/schedules/add', this.newSchedule).then((response) => {
        this.schedules.push(response.data)
        this.newSchedule = {
          title: '',
          description: '',
          classId: '',
          roomId: '',
          courseId: '',
        }
      })
    },
    deleteSchedule(scheduleId) {
      axios.delete(`/api/schedules/delete/${scheduleId}`).then(() => {
        this.schedules = this.schedules.filter((schedule) => schedule.id !== scheduleId)
      })
    },
  },
}
</script>
