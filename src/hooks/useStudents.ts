import { useCallback, useEffect, useState } from 'react'
import {
  createStudent,
  deleteStudent,
  fetchStudents,
  updateStudent,
} from '@/lib/api'
import type { Student, StudentInput } from '@/types'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStudents()
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '학생 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addStudent = async (input: StudentInput) => {
    const created = await createStudent(input)
    setStudents((prev) => [created, ...prev])
    return created
  }

  const editStudent = async (id: string, input: Partial<StudentInput>) => {
    const updated = await updateStudent(id, input)
    setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  const removeStudent = async (id: string) => {
    await deleteStudent(id)
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  return {
    students,
    loading,
    error,
    reload: load,
    addStudent,
    editStudent,
    removeStudent,
  }
}
