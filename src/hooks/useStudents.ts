import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mockStudents } from '@/lib/demoData'
import {
  createStudent,
  deleteStudent,
  fetchStudents,
  updateStudent,
} from '@/lib/api'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { Student, StudentInput } from '@/types'

export function useStudents() {
  const { isDemo } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isDemo) {
      const stored = getStorageItem('demo_students', mockStudents).map((student) => ({
        ...student,
        photoUrl:
          student.photoUrl ??
          (student.photo_path?.startsWith('data:') || student.photo_path?.startsWith('http')
            ? student.photo_path
            : null),
      }))
      setStudents(stored)
      setLoading(false)
      return
    }

    try {
      const data = await fetchStudents()
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '학생 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  const persistDemoStudents = (next: Student[]) => {
    setStorageItem('demo_students', next)
    setStudents(next)
  }

  const addStudent = async (input: StudentInput) => {
    if (isDemo) {
      const created: Student = {
        ...input,
        id: crypto.randomUUID(),
        user_id: 'demo-user-001',
        photo_path: input.photo_path ?? null,
        photoUrl:
          input.photo_path?.startsWith('data:') || input.photo_path?.startsWith('http')
            ? input.photo_path
            : null,
        created_at: new Date().toISOString(),
      }
      persistDemoStudents([created, ...students])
      return created
    }

    const created = await createStudent(input)
    setStudents((prev) => [created, ...prev])
    return created
  }

  const editStudent = async (id: string, input: Partial<StudentInput>) => {
    if (isDemo) {
      const updated = students.map((student) => {
        if (student.id !== id) return student
        const next = { ...student, ...input }
        const path =
          input.photo_path !== undefined ? (input.photo_path ?? null) : (student.photo_path ?? null)
        const photoUrl =
          !path
            ? null
            : path.startsWith('data:') || path.startsWith('http')
              ? path
              : null
        return {
          ...next,
          photo_path: path,
          photoUrl,
        }
      })
      persistDemoStudents(updated)
      return updated.find((student) => student.id === id)!
    }

    const updated = await updateStudent(id, input)
    setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  const removeStudent = async (id: string) => {
    if (isDemo) {
      persistDemoStudents(students.filter((student) => student.id !== id))
      return
    }

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
