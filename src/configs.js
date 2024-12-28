const _scheduleMap = (schedules_) => {
  const schedules = schedules_.map((item) => {
    const startTime = new Date(item.startTime)
    const endTime = new Date(item.endTime)
    const options = { weekday: 'short' } // Define options for formatting weekday
    const weekday = startTime.toLocaleDateString(undefined, options).slice(0, 3) // Extract abbreviated weekday
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const endHour = endTime.getHours()
    const endMinute = endTime.getMinutes()

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      weekday: weekday,
      roomId: item.roomId,
      classId: item.classId,
      startTime: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
      endTime: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
    }
  })
  console.log('Schedules fetched successfully:', this.schedules)
  return schedules
}
const _schedules = [
  {
    id: 1,
    title: 'Math 101',
    description: 'Introduction to Algebra',
    classId: 'C1',
    roomId: 'R1',
    courseId: 'M101',
    startTime: '2024-12-20T08:00:00',
    endTime: '2024-12-20T11:00:00',
  },
  {
    id: 2,
    title: 'Physics 201',
    description: 'Mechanics',
    classId: 'C2',
    roomId: 'R2',
    courseId: 'P201',
    startTime: '2024-12-20T08:00:00', // Overlapping with Math 101
    endTime: '2024-12-20T11:00:00',
  },
  {
    id: 3,
    title: 'Chemistry 101',
    description: 'Organic Chemistry',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C101',
    startTime: '2024-12-20T11:15:00', // 15 minutes pause
    endTime: '2024-12-20T14:15:00',
  },
  {
    id: 4,
    title: 'Biology 101',
    description: 'Cell Biology',
    classId: 'C4',
    roomId: 'R4',
    courseId: 'B101',
    startTime: '2024-12-20T11:15:00', // Overlapping with Chemistry 101
    endTime: '2024-12-20T14:15:00',
  },
  {
    id: 5,
    title: 'Math 102',
    description: 'Calculus',
    classId: 'C1',
    roomId: 'R1',
    courseId: 'M102',
    startTime: '2024-12-20T14:30:00', // 15 minutes pause
    endTime: '2024-12-20T17:30:00',
  },
  {
    id: 6,
    title: 'Physics 202',
    description: 'Thermodynamics',
    classId: 'C2',
    roomId: 'R2',
    courseId: 'P202',
    startTime: '2024-12-20T14:30:00', // Overlapping with Math 102
    endTime: '2024-12-20T17:30:00',
  },
  {
    id: 7,
    title: 'Chemistry 102',
    description: 'Inorganic Chemistry',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C102',
    startTime: '2024-12-21T08:00:00',
    endTime: '2024-12-21T11:00:00',
  },
  {
    id: 8,
    title: 'Biology 102',
    description: 'Genetics',
    classId: 'C4',
    roomId: 'R4',
    courseId: 'B102',
    startTime: '2024-12-21T08:00:00', // Overlapping with Chemistry 102
    endTime: '2024-12-21T11:00:00',
  },
  {
    id: 9,
    title: 'Math 103',
    description: 'Linear Algebra',
    classId: 'C1',
    roomId: 'R1',
    courseId: 'M103',
    startTime: '2024-12-21T11:15:00', // 15 minutes pause
    endTime: '2024-12-21T14:15:00',
  },
  {
    id: 10,
    title: 'Physics 203',
    description: 'Quantum Mechanics',
    classId: 'C2',
    roomId: 'R2',
    courseId: 'P203',
    startTime: '2024-12-21T11:15:00', // Overlapping with Math 103
    endTime: '2024-12-21T14:15:00',
  },
  {
    id: 11,
    title: 'Chemistry 103',
    description: 'Physical Chemistry',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C103',
    startTime: '2024-12-21T14:30:00', // 15 minutes pause
    endTime: '2024-12-21T17:30:00',
  },
  {
    id: 12,
    title: 'Biology 103',
    description: 'Ecology',
    classId: 'C4',
    roomId: 'R4',
    courseId: 'B103',
    startTime: '2024-12-21T14:30:00', // Overlapping with Chemistry 103
    endTime: '2024-12-21T17:30:00',
  },
  {
    id: 13,
    title: 'Math 104',
    description: 'Differential Equations',
    classId: 'C1',
    roomId: 'R1',
    courseId: 'M104',
    startTime: '2024-12-22T08:00:00',
    endTime: '2024-12-22T11:00:00',
  },
  {
    id: 14,
    title: 'Physics 204',
    description: 'Electromagnetism',
    classId: 'C2',
    roomId: 'R2',
    courseId: 'P204',
    startTime: '2024-12-22T08:00:00', // Overlapping with Math 104
    endTime: '2024-12-22T11:00:00',
  },
  {
    id: 15,
    title: 'Chemistry 104',
    description: 'Analytical Chemistry',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C104',
    startTime: '2024-12-22T11:15:00', // 15 minutes pause
    endTime: '2024-12-22T14:15:00',
  },
  {
    id: 16,
    title: 'Biology 104',
    description: 'Microbiology',
    classId: 'C4',
    roomId: 'R4',
    courseId: 'B104',
    startTime: '2024-12-22T11:15:00', // Overlapping with Chemistry 104
    endTime: '2024-12-22T14:15:00',
  },
  {
    id: 17,
    title: 'Math 105',
    description: 'Statistics',
    classId: 'C1',
    roomId: 'R1',
    courseId: 'M105',
    startTime: '2024-12-22T14:30:00', // 15 minutes pause
    endTime: '2024-12-22T17:30:00',
  },
  {
    id: 18,
    title: 'Physics 205',
    description: 'Optics',
    classId: 'C2',
    roomId: 'R2',
    courseId: 'P205',
    startTime: '2024-12-22T14:30:00', // Overlapping with Math 105
    endTime: '2024-12-22T17:30:00',
  },
  {
    id: 19,
    title: 'Chemistry 105',
    description: 'Biochemistry',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C105',
    startTime: '2024-12-23T08:00:00',
    endTime: '2024-12-23T11:00:00',
  },
  {
    id: 21,
    title: 'alchimy 102',
    description: 'Alchemy',
    classId: 'C3',
    roomId: 'R3',
    courseId: 'C105',
    startTime: '2024-12-24T08:00:00',
    endTime: '2024-12-24T11:00:00',
  },
  {
    id: 20,
    title: 'Biology 105',
    description: 'Evolution',
    classId: 'C4',
    roomId: 'R4',
    courseId: 'B105',
    startTime: '2024-12-23T08:00:00', // Overlapping with Chemistry 105
    endTime: '2024-12-23T11:00:00',
  },
]

export const schedules = _schedules
export const scheduleMap = _scheduleMap
